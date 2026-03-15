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
Object.defineProperty(exports, "__esModule", { value: true });
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const type_1 = require("../types/type");
const db_1 = require("../db/db");
const router = (0, express_1.Router)();
//@ts-ignore
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log("comming body is ", body);
    //@ts-ignore
    const userId = req.id;
    // Validate request body
    const parsedData = type_1.ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "incorrect inputs",
        });
    }
    console.log("comming body is", JSON.stringify(body, null, 2));
    console.log("parsed data is", JSON.stringify(parsedData, null, 2));
    parsedData.data.actions.forEach((a, i) => {
        console.log(`Action ${i}:`, JSON.stringify(a, null, 2));
    });
    try {
        // Start transaction with sensible timeout 
        const zapId = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Create Zap
            const zap = yield tx.zap.create({
                data: {
                    userId: userId,
                    triggerId: "",
                    actions: {
                        create: parsedData.data.actions.map((x, index) => ({
                            actionId: x.availableActionId,
                            sortingOrder: index,
                            metadata: x.actionMetadata,
                        })),
                    },
                },
            });
            // Create Trigger and connect to AvailableTrigger
            const trigger = yield tx.trigger.create({
                data: {
                    zapId: zap.id,
                    triggerId: parsedData.data.availableTriggerId,
                    metadata: parsedData.data.triggerMetadata, // must exist in AvailableTrigger
                },
            });
            // Update Zap with triggerId
            yield tx.zap.update({
                where: { id: zap.id },
                data: { triggerId: trigger.id },
            });
            return zap.id;
        }), {
            maxWait: 5000,
            timeout: 10000,
        });
        // Respond with the new zapId
        return res.json({ zapId });
    }
    catch (err) {
        console.error("Transaction failed: ", err);
        return res.status(500).json({
            message: "Something went wrong while creating zap",
        });
    }
}));
//@ts-ignore
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            userId: id
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    return res.json({
        zaps
    });
}));
//@ts-ignore
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.id;
    const zapId = req.params.zapId;
    const zap = yield db_1.prismaClient.zap.findUnique({
        where: {
            id: zapId,
            userId: userId,
        },
        include: {
            actions: {
                orderBy: { sortingOrder: "asc" },
                include: { type: true },
            },
            trigger: {
                include: { type: true },
            },
        },
    });
    if (!zap) {
        return res.status(404).json({ error: "Zap not found" });
    }
    return res.json({ zap });
}));
//@ts-ignore
router.delete("/action/:actionId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const actionId = req.params.actionId;
    //@ts-ignore
    const userId = req.id;
    try {
        // Ensure the action belongs to the user's zap
        const action = yield db_1.prismaClient.action.findFirst({
            where: {
                id: actionId,
                zap: {
                    userId: userId,
                },
            },
        });
        if (!action) {
            return res.status(404).json({ error: "Action not found or access denied" });
        }
        // Start transaction for atomicity
        yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.action.delete({
                where: { id: actionId },
            });
            const remainingActions = yield tx.action.findMany({
                where: { zapId: action.zapId },
            });
            if (remainingActions.length === 0) {
                yield tx.zapRun.deleteMany({
                    where: { zapId: action.zapId },
                });
                yield tx.trigger.delete({
                    where: { zapId: action.zapId },
                });
                yield tx.zap.delete({
                    where: { id: action.zapId },
                });
            }
        }));
        return res.json({
            message: "action deleted successfully",
        });
    }
    catch (err) {
        console.error("Failed to delete action:", err);
        return res.status(500).json({ message: "Failed to delete action" });
    }
}));
//@ts-ignore
router.put("/action/:actionId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const actionId = req.params.actionId;
    const { metadata } = req.body;
    //@ts-ignore
    const userId = req.id;
    if (typeof metadata !== "object") {
        return res.status(400).json({ error: "Invalid metadata format" });
    }
    try {
        // Ensure the action belongs to the user's zap
        const action = yield db_1.prismaClient.action.findFirst({
            where: {
                id: actionId,
                zap: {
                    userId: userId,
                },
            },
        });
        if (!action) {
            return res.status(404).json({ error: "Action not found" });
        }
        yield db_1.prismaClient.action.update({
            where: { id: actionId },
            data: { metadata: metadata },
        });
        return res.json({ message: "action updated successfully" });
    }
    catch (err) {
        console.error("Failed to update action:", err);
        return res.status(500).json({ message: "Failed to update action" });
    }
}));
exports.zapRouter = router;
