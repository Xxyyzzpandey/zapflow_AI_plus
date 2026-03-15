import {Kafka} from "kafkajs"
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./email";
import { sendSol } from "./solana";
import { JsonObject } from "@prisma/client/runtime/library";
import Mustache from "mustache";
import { sendDiscord } from "./discord";
import { sendTelegram } from "./telegram";
import { fetchNotionRows } from "./Notiondocs";
import { writeToNotionDocs } from "./WritetoNotiondocs";

const prismaClient=new PrismaClient();

const TOPIC_NAME="zap-events"

const kafka =new Kafka({
    clientId:'outbox-processor',
    brokers:['localhost:9092']
})

// const kafka = new Kafka({
//   clientId: "outbox-processor",
//   brokers: [process.env.KAFKA_BROKER as string],
//   ssl: true,
//   sasl: {
//     mechanism: "scram-sha-256",
//     username: process.env.KAFKA_USERNAME as string ,
//     password:  process.env.KAFKA_PASSWORD as string,
//   },
// });

async function main(){
    const consumer =kafka.consumer({groupId:'main-worker'});
    await consumer.connect();
    const producer=kafka.producer();
    await producer.connect();

    await consumer.subscribe({topic:"zap-events",fromBeginning:true});

    await consumer.run({
        autoCommit:false,
        eachMessage:async ({topic,partition,message})=>{
            console.log({
                partition,
                offset:message.offset,
                value:message.value?.toString(),
            })
             if(!message.value?.toString()){
                return;
             }

             const parsedValue = JSON.parse(message.value?.toString());
             const zapRunId = parsedValue.zapRunId;
             const stage = parsedValue.stage ?? 0;  // default to 0 if not present

             const zapRunDetails = await prismaClient.zapRun.findFirst({
               where: { id: zapRunId },
               include: {
                 zap: {
                   include: {
                     actions: { include: { type: true } }
                   }
                 }
               }
             });



const currentAction = zapRunDetails?.zap.actions.find(
  (x) => Number(x.sortingOrder) === Number(stage)
);


if (!currentAction) {
  console.log(`current action not found for stage ${stage}`);
  return;
}
console.log("Stage from message:", stage, typeof stage);
console.log("Actions sortingOrder:", zapRunDetails?.zap.actions.map(a => [a.sortingOrder, typeof a.sortingOrder]));

console.log("current action is ",currentAction);


if (currentAction.type.name === "email") {
  const metadata = currentAction.metadata as Record<string, string>;
  
  console.log(metadata);

  // Use Mustache or your custom parse function
  const to = Mustache.render(metadata.to ?? "", runtimeData);
  const from = Mustache.render(metadata.from ?? "no-reply@myapp.com", runtimeData);
  const senderName = Mustache.render(metadata.senderName ?? "ZapFlow ", runtimeData);
  const subject = Mustache.render(metadata.subject ?? "No Subject", runtimeData);
  const body = Mustache.render(metadata.body ?? "", runtimeData);

  console.log("📧 Sending email", { to, from, senderName, subject, body });
  try{
  await sendEmail(from,senderName,to,subject,body);
  }catch(error){
    console.log("error in sending email",error);
  }
}


           //send sol 
            // if (currentAction.type.name === "send-sol") {
            // const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
            // const address = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
            // console.log(`Sending out SOL of ${amount} to address ${address}`);
            // await sendSol(address, amount);
            // }
             
           //send message to  discord
            if (currentAction.type.name === "Discord") {
              const metadata = currentAction.metadata as Record<string, string>;
              const runtimeData = zapRunMetadata as Record<string, any>;
            
              const webhookUrl = Mustache.render(metadata.webhookUrl ?? "", runtimeData);
              const message = Mustache.render(metadata.content ?? "", runtimeData);
            
              console.log(" Sending Discord message:", { webhookUrl, message });
              await sendDiscord(webhookUrl, message);
            }

             
            if (currentAction.type.name === "Telegram") {
               const metadata = currentAction.metadata as Record<string, string>;
               const runtimeData = zapRunMetadata as Record<string, any>;
             
               const botToken = Mustache.render(metadata.botToken ?? "", runtimeData);
               const chatId = Mustache.render(metadata.chatId ?? "", runtimeData);
               const message = Mustache.render(metadata.message ?? "", runtimeData);
             
               console.log("📨 Sending Telegram message:", { chatId, message });
             
               await sendTelegram(botToken, chatId, message);
             }

// Special case: Notion trigger → loop rows
if (zapRunDetails?.zap.triggerId === "Notion_docs") {
  let rows: any[] = [];

  try {
    const notionKey = runtimeData?.notionKey;
    const databaseId = runtimeData?.databaseId;

    if (!notionKey || !databaseId) {
      console.error("Missing notionKey or databaseId in zapRunMetadata");
      return;
    }

    // Fetch rows from Notion database
    rows = await fetchNotionRows(notionKey, databaseId);
    console.log(`📒 Fetched ${rows.length} rows from Notion database`);
  } catch (error) {
    console.error("Error fetching data from Notion docs:", error);
    return;
  }

  if (currentAction.type.name === "email") {
    try {
      for (const row of rows) {
  const runtimeData = {
    ...(typeof zapRunMetadata === "object" && zapRunMetadata ? zapRunMetadata : {}),
    ...row,
  };

  const metadata = currentAction.metadata as Record<string, string>;

  const to = Mustache.render(metadata.to ?? "", runtimeData);
  const from = Mustache.render(metadata.from ?? "no-reply@myapp.com", runtimeData);
  const senderName = Mustache.render(metadata.senderName ?? "Zapier Clone", runtimeData);
  const subject = Mustache.render(metadata.subject ?? "No Subject", runtimeData);
  const body = Mustache.render(metadata.body ?? "", runtimeData);

  console.log(`📧 Sending email (Notion trigger): To=${to}, Subject=${subject}`);
  // await sendEmail(from, senderName, to, subject, body);
}


      console.log("✅ Finished processing Notion → Email action");
    } catch (err) {
      console.error("❌ Error processing Notion → Email action:", err);
    }
  }
}

//write to notion docs 
if (currentAction.type.name === "Notion_docs") {
  const metadata = currentAction.metadata as Record<string, string>;
  const runtimeData = zapRunMetadata as Record<string, any>;

  const notionKey = Mustache.render(metadata.notionKey ?? "", runtimeData);
  const databaseId = Mustache.render(metadata.databaseId ?? "", runtimeData);

  try {
    console.log(`📒 Writing data to Notion database ${databaseId}`);
    console.log("notion meta data is ",runtimeData)

    // await writeToNotionDocs(notionKey, databaseId, runtimeData);

    console.log(`✅ Successfully wrote data to Notion`);
  } catch (err) {
    console.error("❌ Failed to write data to Notion:", err);
  }
}



            const zapId=message.value?.toString();
            const lastStage=(zapRunDetails?.zap.actions?.length || 1)-1;
            if(lastStage !==stage){
                await producer.send({
                   topic:TOPIC_NAME,
                   messages:[{
                    value:JSON.stringify({
                         stage:stage+1,
                        zapRunId
                     })
                  }]
                })
            }
            //how we do if we have multiple actions like sendemail,sendmoney ,zoom ,ect
            //for this we parse message and see the type and according to that we just call out functons sendEmail() ,sendMoney() 
            //this function are present in other folder we just call it here according to job

            await consumer.commitOffsets([{
                topic:TOPIC_NAME,
                partition:partition,
                offset:(parseInt(message.offset)+1).toString()  //5
            }])
        }
    })
}

main()



