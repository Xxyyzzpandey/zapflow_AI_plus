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
exports.userSecret = void 0;
const express_1 = require("express");
const db_1 = require("../db/db");
const middleware_1 = require("../middleware"); // Ensure this is imported
const crypto_1 = require("../lib/crypto");
const router = (0, express_1.Router)();
//@ts-ignore
router.post("/secret", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { integrationType, secret } = req.body;
    const userId = req.id;
    if (!integrationType || !secret) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const encryptedSecret = (0, crypto_1.encrypt)(JSON.stringify(secret));
        yield db_1.prismaClient.userSecret.upsert({
            where: {
                userId_integrationType: {
                    userId,
                    integrationType
                }
            },
            update: {
                encryptedSecret
            },
            create: {
                userId,
                integrationType,
                encryptedSecret
            }
        });
        res.json({ message: "Secret saved successfully" });
    }
    catch (error) {
        console.error("Database error in /secret:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.userSecret = router;
