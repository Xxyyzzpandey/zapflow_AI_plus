
import { Router } from "express";
import Groq from "groq-sdk";
import { prismaClient } from "../db/db";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types/type";
import { decrypt } from "../lib/crypto";

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

//@ts-ignore
router.post("/", authMiddleware, async (req, res) => {

  const { prompt } = req.body;
  const userId = (req as any).id;

  if (!prompt) {
    return res.status(400).json({
      message: "Prompt required"
    });
  }

  try {

    console.log("User Prompt:", prompt);

    /*
    ==============================
    1️⃣ Load Available Integrations
    ==============================
    */

    const [availableTriggers, availableActions] = await Promise.all([
      prismaClient.availableTrigger.findMany(),
      prismaClient.availableAction.findMany()
    ]);

    console.log("Available Triggers:", availableTriggers);
    console.log("Available Actions:", availableActions);

    /*
    ==============================
    2️⃣ Prepare Lists For AI
    ==============================
    */

    const triggerList = availableTriggers
      .map(t => `${t.id} : ${t.name}`)
      .join("\n");

    const actionList = availableActions
      .map(a => `${a.id} : ${a.name}`)
      .join("\n");

   
//generating workflow
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are an automation workflow generator.

You MUST ONLY use the IDs provided below.

Triggers:
${triggerList}

Actions:
${actionList}

Each action requires metadata.

Examples:

Telegram
{
 "chatId":"-50527562054",
 "botToken":"BOT_TOKEN",
 "message":"Message from {{response.email}}"
}

Discord
{
 "content":"New response from {{response.name}} {{response.email}}"
}

Email
{
 "to":"admin@mail.com",
 "subject":"New Comment",
 "body":"User {{response.email}} commented"
}

Return ONLY JSON:

{
 "availableTriggerId":"string",
 
 "actions":[
   {
     "availableActionId":"string",
     "actionMetadata":{}
   }
 ],
 "explanation":"short explanation"
}
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;

    console.log("AI RAW RESPONSE:", content);

    if (!content) {
      return res.status(500).json({
        message: "AI returned empty response"
      });
    }

    let aiParsedData;

    try {
      aiParsedData = JSON.parse(content);
    } catch {
      return res.status(500).json({
        message: "AI returned invalid JSON"
      });
    }

    console.log("AI PARSED DATA:", aiParsedData);

  //validating produced ai response
    const validation = ZapCreateSchema.safeParse(aiParsedData);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid AI zap structure"
      });
    }

    const data = validation.data;

    console.log("Validated Data:", data);

    
//checking wheather trigger exist
    const triggerExists = availableTriggers.find(
      t => t.id === data.availableTriggerId
    );

    if (!triggerExists) {
      return res.status(400).json({
        message: "Invalid trigger returned by AI"
      });
    }

    //valaditing wheather action exist
    console.log("AI Actions:", data.actions);

    
   //detecting action type using name
    const actionIntegrations = data.actions
      .map(a => {
        const action = availableActions.find(
          x => x.id === a.availableActionId
        );

        const integration = action?.name?.toLowerCase();

        console.log("Detected integration for action:", integration);

        return integration;
      })
      .filter(Boolean);

    console.log("Action Integrations:", actionIntegrations);

    //loading user secret 
    const secrets = await prismaClient.userSecret.findMany({
      where: {
        userId,
        integrationType: {
          //@ts-ignore
          in: actionIntegrations
        }
      }
    });

    console.log("Loaded Secrets:", secrets);

    const secretMap = new Map(
      secrets.map(s => [
        s.integrationType,
        JSON.parse(decrypt(s.encryptedSecret))
      ])
    );

    console.log("Secret Map:", secretMap);

    //merging metadata and secret
  //   const actionsWithSecrets = data.actions.map(a => {

  //     const action = availableActions.find(
  //       x => x.id === a.availableActionId
  //     );

  //     const integration = action?.name?.toLowerCase();
  // //@ts-ignore
  //     const secret = secretMap.get(integration) || {};

  //     console.log("Merging Metadata for:", integration);
  //     console.log("AI Metadata:", a.actionMetadata);
  //     console.log("Secret:", secret);

  //     return {
  //       ...a,
  //       actionMetadata: {
  //         ...a.actionMetadata,
  //         ...secret
  //       }
  //     };

  //   });
  // 🔟 Merge Metadata + Secrets

  //@ts-ignore
    
//now creating zap
    const zap = await prismaClient.$transaction(async (tx) => {

      const zap = await tx.zap.create({
        data: {
          userId,
          triggerId: data.availableTriggerId
        }
      });

      await tx.trigger.create({
        data: {
          zapId: zap.id,
          triggerId: data.availableTriggerId,
          metadata: data.triggerMetadata
        }
      });

      await tx.action.createMany({
        //@ts-ignore
        data: actionsWithSecrets.map((a, index) => ({
          zapId: zap.id,
          actionId: a.availableActionId,
          metadata: a.actionMetadata,
          sortingOrder: index
        }))
      });

      return zap;

    });

    console.log("Created Zap:", zap);

    //preparing response to send to frontend
    const trigger = availableTriggers.find(
      t => t.id === data.availableTriggerId
    );

    const actions = data.actions
      .map(a =>
        availableActions.find(
          x => x.id === a.availableActionId
        )
      )
      .filter(Boolean);

    res.json({
      message: "Zap created successfully",
      zapId: zap.id,
      trigger,
      actions,
      explanation: aiParsedData.explanation || null
    });

  } catch (error) {

    console.error("AI Zap Error:", error);

    res.status(500).json({
      message: "AI zap creation failed"
    });

  }

});

export default router;