import { PrismaClient } from "@prisma/client";
import { performActionLogic } from "./performActionLogic";

const prismaClient=new PrismaClient();

export async function executeZap(zapRunId: string, stage: number) {
  const zapRunDetails = await prismaClient.zapRun.findFirst({
    where: { id: zapRunId },
    include: { zap: { include: { actions: { include: { type: true } } } } }
  });

  if (!zapRunDetails) return;

  

  // Perform your logic (email, discord, etc.)
  try {
    // Call your existing helper functions here (sendEmail, sendDiscord, etc.)
    await performActionLogic(currentAction, zapRunDetails.metadata);
  } catch (err) {
    console.error(`Error at stage ${stage}:`, err);
    return; // Exit if a stage fails
  }

  // RECURSIVE CALL: Move to the next action if it exists
  const nextStage = stage + 1;
  if (nextStage < zapRunDetails.zap.actions.length) {
    setImmediate(() => executeZap(zapRunId, nextStage));
  }
}