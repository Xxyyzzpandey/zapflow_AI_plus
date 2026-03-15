"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOOKS_URL = exports.JWT_PASSWORD = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.JWT_PASSWORD) {
    throw new Error("JWT_PASSWORD missing in .env file");
}
exports.JWT_PASSWORD = process.env.JWT_PASSWORD;
exports.HOOKS_URL = process.env.HOOKS_URL;
