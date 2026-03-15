"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const client_1 = require("@prisma/client");
const email_1 = require("./email");
const mustache_1 = __importDefault(require("mustache"));
const discord_1 = require("./discord");
const telegram_1 = require("./telegram");
const Notiondocs_1 = require("./Notiondocs");
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
});
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: 'main-worker' });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({ topic: "zap-events", fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
                console.log({
                    partition,
                    offset: message.offset,
                    value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                if (!((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_d = message.value) === null || _d === void 0 ? void 0 : _d.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = (_e = parsedValue.stage) !== null && _e !== void 0 ? _e : 0; // default to 0 if not present
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
                    where: { id: zapRunId },
                    include: {
                        zap: {
                            include: {
                                actions: { include: { type: true } }
                            }
                        }
                    }
                });
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                console.log("meta data is ", zapRunMetadata);
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find((x) => Number(x.sortingOrder) === Number(stage));
                if (!currentAction) {
                    console.log(`current action not found for stage ${stage}`);
                    return;
                }
                console.log("Stage from message:", stage, typeof stage);
                console.log("Actions sortingOrder:", zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.map(a => [a.sortingOrder, typeof a.sortingOrder]));
                console.log("current action is ", currentAction);
                if (currentAction.type.name === "email") {
                    const metadata = currentAction.metadata;
                    const runtimeData = zapRunMetadata;
                    console.log(metadata);
                    // Use Mustache or your custom parse function
                    const to = mustache_1.default.render((_f = metadata.to) !== null && _f !== void 0 ? _f : "", runtimeData);
                    const from = mustache_1.default.render((_g = metadata.from) !== null && _g !== void 0 ? _g : "no-reply@myapp.com", runtimeData);
                    const senderName = mustache_1.default.render((_h = metadata.senderName) !== null && _h !== void 0 ? _h : "ZapFlow ", runtimeData);
                    const subject = mustache_1.default.render((_j = metadata.subject) !== null && _j !== void 0 ? _j : "No Subject", runtimeData);
                    const body = mustache_1.default.render((_k = metadata.body) !== null && _k !== void 0 ? _k : "", runtimeData);
                    console.log("📧 Sending email", { to, from, senderName, subject, body });
                    try {
                        yield (0, email_1.sendEmail)(from, senderName, to, subject, body);
                    }
                    catch (error) {
                        console.log("error in sending email", error);
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
                    const metadata = currentAction.metadata;
                    const runtimeData = zapRunMetadata;
                    const webhookUrl = mustache_1.default.render((_l = metadata.webhookUrl) !== null && _l !== void 0 ? _l : "", runtimeData);
                    const message = mustache_1.default.render((_m = metadata.content) !== null && _m !== void 0 ? _m : "", runtimeData);
                    console.log(" Sending Discord message:", { webhookUrl, message });
                    yield (0, discord_1.sendDiscord)(webhookUrl, message);
                }
                if (currentAction.type.name === "Telegram") {
                    const metadata = currentAction.metadata;
                    const runtimeData = zapRunMetadata;
                    const botToken = mustache_1.default.render((_o = metadata.botToken) !== null && _o !== void 0 ? _o : "", runtimeData);
                    const chatId = mustache_1.default.render((_p = metadata.chatId) !== null && _p !== void 0 ? _p : "", runtimeData);
                    const message = mustache_1.default.render((_q = metadata.message) !== null && _q !== void 0 ? _q : "", runtimeData);
                    console.log("📨 Sending Telegram message:", { chatId, message });
                    yield (0, telegram_1.sendTelegram)(botToken, chatId, message);
                }
                // Special case: Notion trigger → loop rows
                if ((zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.triggerId) === "Notion_docs") {
                    let rows = [];
                    try {
                        const runtimeData = zapRunMetadata;
                        const notionKey = runtimeData === null || runtimeData === void 0 ? void 0 : runtimeData.notionKey;
                        const databaseId = runtimeData === null || runtimeData === void 0 ? void 0 : runtimeData.databaseId;
                        if (!notionKey || !databaseId) {
                            console.error("Missing notionKey or databaseId in zapRunMetadata");
                            return;
                        }
                        // Fetch rows from Notion database
                        rows = yield (0, Notiondocs_1.fetchNotionRows)(notionKey, databaseId);
                        console.log(`📒 Fetched ${rows.length} rows from Notion database`);
                    }
                    catch (error) {
                        console.error("Error fetching data from Notion docs:", error);
                        return;
                    }
                    if (currentAction.type.name === "email") {
                        try {
                            for (const row of rows) {
                                const runtimeData = Object.assign(Object.assign({}, (typeof zapRunMetadata === "object" && zapRunMetadata ? zapRunMetadata : {})), row);
                                const metadata = currentAction.metadata;
                                const to = mustache_1.default.render((_r = metadata.to) !== null && _r !== void 0 ? _r : "", runtimeData);
                                const from = mustache_1.default.render((_s = metadata.from) !== null && _s !== void 0 ? _s : "no-reply@myapp.com", runtimeData);
                                const senderName = mustache_1.default.render((_t = metadata.senderName) !== null && _t !== void 0 ? _t : "Zapier Clone", runtimeData);
                                const subject = mustache_1.default.render((_u = metadata.subject) !== null && _u !== void 0 ? _u : "No Subject", runtimeData);
                                const body = mustache_1.default.render((_v = metadata.body) !== null && _v !== void 0 ? _v : "", runtimeData);
                                console.log(`📧 Sending email (Notion trigger): To=${to}, Subject=${subject}`);
                                // await sendEmail(from, senderName, to, subject, body);
                            }
                            console.log("✅ Finished processing Notion → Email action");
                        }
                        catch (err) {
                            console.error("❌ Error processing Notion → Email action:", err);
                        }
                    }
                }
                //write to notion docs 
                if (currentAction.type.name === "Notion_docs") {
                    const metadata = currentAction.metadata;
                    const runtimeData = zapRunMetadata;
                    const notionKey = mustache_1.default.render((_w = metadata.notionKey) !== null && _w !== void 0 ? _w : "", runtimeData);
                    const databaseId = mustache_1.default.render((_x = metadata.databaseId) !== null && _x !== void 0 ? _x : "", runtimeData);
                    try {
                        console.log(`📒 Writing data to Notion database ${databaseId}`);
                        console.log("notion meta data is ", runtimeData);
                        // await writeToNotionDocs(notionKey, databaseId, runtimeData);
                        console.log(`✅ Successfully wrote data to Notion`);
                    }
                    catch (err) {
                        console.error("❌ Failed to write data to Notion:", err);
                    }
                }
                const zapId = (_y = message.value) === null || _y === void 0 ? void 0 : _y.toString();
                const lastStage = (((_z = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions) === null || _z === void 0 ? void 0 : _z.length) || 1) - 1;
                if (lastStage !== stage) {
                    yield producer.send({
                        topic: TOPIC_NAME,
                        messages: [{
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    zapRunId
                                })
                            }]
                    });
                }
                //how we do if we have multiple actions like sendemail,sendmoney ,zoom ,ect
                //for this we parse message and see the type and according to that we just call out functons sendEmail() ,sendMoney() 
                //this function are present in other folder we just call it here according to job
                yield consumer.commitOffsets([{
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString() //5
                    }]);
            })
        });
    });
}
main();
