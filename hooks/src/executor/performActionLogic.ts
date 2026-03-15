import { sendEmail } from "./email";
import { sendDiscord } from "./discord";
import { sendTelegram } from "./telegram";
import { writeToNotionDocs } from "./WritetoNotiondocs";
import Mustache from "mustache";

export async function performActionLogic(currentAction: any, zapRunMetadata: any) {
  const runtimeData = zapRunMetadata as Record<string, any>;
  // console.log("metadata from performaction function: ",metadata);
  switch (currentAction.type.name) {
    case "email":
      const to = Mustache.render(metadata.to ?? "", runtimeData);
      const from = Mustache.render(metadata.from ?? "no-reply@myapp.com", runtimeData);
      const senderName = Mustache.render(metadata.senderName ?? "ZapFlow", runtimeData);
      const subject = Mustache.render(metadata.subject ?? "No Subject", runtimeData);
      const body = Mustache.render(metadata.body ?? "", runtimeData);
      // console.log( "data after combinations to {to}",to);
      // console.log( "data after combinations to {body}",body);
      return await sendEmail(from, senderName, to, subject, body);

    case "Discord":
      const discordWebhook = Mustache.render(metadata.webhookUrl ?? "", runtimeData);
      const discordMsg = Mustache.render(metadata.content ?? "", runtimeData);
      return await sendDiscord(discordWebhook, discordMsg);

    case "Telegram":
      const botToken = Mustache.render(metadata.botToken ?? "", runtimeData);
      const chatId = Mustache.render(metadata.chatId ?? "", runtimeData);
      const telegramMsg = Mustache.render(metadata.message ?? "", runtimeData);
      return await sendTelegram(botToken, chatId, telegramMsg);

    case "Notion_docs":
      const notionKey = Mustache.render(metadata.notionKey ?? "", runtimeData);
      const databaseId = Mustache.render(metadata.databaseId ?? "", runtimeData);
      // Assuming your writeToNotionDocs handles the runtimeData object
      return await writeToNotionDocs(notionKey, databaseId, runtimeData);

    default:
      console.warn(`Action type ${currentAction.type.name} not implemented.`);
  }
}