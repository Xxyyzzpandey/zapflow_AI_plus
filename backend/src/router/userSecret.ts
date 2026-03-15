import { Router } from "express";
import { prismaClient } from "../db/db";
import { authMiddleware } from "../middleware"; // Ensure this is imported
import { encrypt } from "../lib/crypto";

const router = Router();


//@ts-ignore
router.post("/secret",authMiddleware, async (req, res) => {
  const { integrationType, secret } = req.body;
  const userId = (req as any).id;

  if (!integrationType || !secret) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const encryptedSecret = encrypt(JSON.stringify(secret));

    await prismaClient.userSecret.upsert({
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

  } catch (error) {
    console.error("Database error in /secret:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export const userSecret = router;