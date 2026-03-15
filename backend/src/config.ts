import dotenv from "dotenv"
dotenv.config();

if (!process.env.JWT_PASSWORD) {
  throw new Error("JWT_PASSWORD missing in .env file");
}
export const JWT_PASSWORD=process.env.JWT_PASSWORD
export const HOOKS_URL=process.env.HOOKS_URL;