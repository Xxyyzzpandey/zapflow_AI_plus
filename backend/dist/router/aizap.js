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
const express_1 = require("express");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const db_1 = require("../db/db");
const middleware_1 = require("../middleware");
const type_1 = require("../types/type");
const crypto_1 = require("../lib/crypto");
const router = (0, express_1.Router)();
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY
});
//@ts-ignore
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { prompt } = req.body;
    const userId = req.id;
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
        const [availableTriggers, availableActions] = yield Promise.all([
            db_1.prismaClient.availableTrigger.findMany(),
            db_1.prismaClient.availableAction.findMany()
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
        const completion = yield groq.chat.completions.create({
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
 "chatId":"-5052502054",
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
 "triggerMetadata":{},
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
        }
        catch (_b) {
            return res.status(500).json({
                message: "AI returned invalid JSON"
            });
        }
        console.log("AI PARSED DATA:", aiParsedData);
        //validating produced ai response
        const validation = type_1.ZapCreateSchema.safeParse(aiParsedData);
        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid AI zap structure"
            });
        }
        const data = validation.data;
        console.log("Validated Data:", data);
        //checking wheather trigger exist
        const triggerExists = availableTriggers.find(t => t.id === data.availableTriggerId);
        if (!triggerExists) {
            return res.status(400).json({
                message: "Invalid trigger returned by AI"
            });
        }
        //valaditing wheather action exist
        console.log("AI Actions:", data.actions);
        for (const action of data.actions) {
            const actionExists = availableActions.find(a => a.id === action.availableActionId);
            if (!actionExists) {
                return res.status(400).json({
                    message: `Invalid action: ${action.availableActionId}`
                });
            }
        }
        //detecting action type using name
        const actionIntegrations = data.actions
            .map(a => {
            var _a;
            const action = availableActions.find(x => x.id === a.availableActionId);
            const integration = (_a = action === null || action === void 0 ? void 0 : action.name) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            console.log("Detected integration for action:", integration);
            return integration;
        })
            .filter(Boolean);
        console.log("Action Integrations:", actionIntegrations);
        //loading user secret 
        const secrets = yield db_1.prismaClient.userSecret.findMany({
            where: {
                userId,
                integrationType: {
                    //@ts-ignore
                    in: actionIntegrations
                }
            }
        });
        console.log("Loaded Secrets:", secrets);
        const secretMap = new Map(secrets.map(s => [
            s.integrationType,
            JSON.parse((0, crypto_1.decrypt)(s.encryptedSecret))
        ]));
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
        const integrationsRequiringSecrets = ["telegram", "discord", "email"];
        const actionsWithSecrets = [];
        for (const a of data.actions) {
            const action = availableActions.find(x => x.id === a.availableActionId);
            const integration = (_a = action === null || action === void 0 ? void 0 : action.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim();
            //@ts-ignore
            const secret = secretMap.get(integration);
            //@ts-ignore
            if (!secret && integrationsRequiringSecrets.includes(integration)) {
                return res.status(400).json({
                    message: `Missing secret for ${integration}. Provide it in secret tab in navbar.`
                });
            }
            actionsWithSecrets.push(Object.assign(Object.assign({}, a), { actionMetadata: Object.assign(Object.assign({}, a.actionMetadata), (secret || {})) }));
        }
        console.log("Final Actions With Secrets:", actionsWithSecrets);
        //now creating zap
        const zap = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const zap = yield tx.zap.create({
                data: {
                    userId,
                    triggerId: data.availableTriggerId
                }
            });
            yield tx.trigger.create({
                data: {
                    zapId: zap.id,
                    triggerId: data.availableTriggerId,
                    metadata: data.triggerMetadata
                }
            });
            yield tx.action.createMany({
                //@ts-ignore
                data: actionsWithSecrets.map((a, index) => ({
                    zapId: zap.id,
                    actionId: a.availableActionId,
                    metadata: a.actionMetadata,
                    sortingOrder: index
                }))
            });
            return zap;
        }));
        console.log("Created Zap:", zap);
        //preparing response to send to frontend
        const trigger = availableTriggers.find(t => t.id === data.availableTriggerId);
        const actions = data.actions
            .map(a => availableActions.find(x => x.id === a.availableActionId))
            .filter(Boolean);
        res.json({
            message: "Zap created successfully",
            zapId: zap.id,
            trigger,
            actions,
            explanation: aiParsedData.explanation || null
        });
    }
    catch (error) {
        console.error("AI Zap Error:", error);
        res.status(500).json({
            message: "AI zap creation failed"
        });
    }
}));
exports.default = router;
