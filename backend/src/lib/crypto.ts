import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

// Ensure env exists
const keyHex = process.env.ENCRYPTION_KEY;
console.log(process.env.ENCRYPTION_KEY);

if (!keyHex) {
  throw new Error("ENCRYPTION_KEY missing in environment variables");
}

const KEY = Buffer.from(keyHex, "hex");

if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {

  const [ivHex, encrypted] = text.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
}