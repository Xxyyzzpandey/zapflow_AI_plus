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
exports.writeToNotionDocs = writeToNotionDocs;
function writeToNotionDocs(notionKey, databaseId, properties) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://api.notion.com/v1/pages";
        try {
            // Prepare the formatted properties expected by Notion API
            const formattedProperties = {};
            for (const key in properties) {
                const value = properties[key];
                // Simple heuristic to map data types to Notion properties
                if (typeof value === "string") {
                    formattedProperties[key] = { rich_text: [{ text: { content: value } }] };
                }
                else if (typeof value === "number") {
                    formattedProperties[key] = { number: value };
                }
                else if (typeof value === "boolean") {
                    formattedProperties[key] = { checkbox: value };
                }
                else {
                    formattedProperties[key] = { rich_text: [{ text: { content: String(value) } }] };
                }
            }
            const body = {
                parent: { database_id: databaseId },
                properties: formattedProperties,
            };
            const res = yield fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${notionKey}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                throw new Error(`Notion API responded with status ${res.status}`);
            }
            const data = yield res.json();
            return data;
        }
        catch (error) {
            console.error("❌ Failed to write to Notion docs:", error);
            throw new Error("Failed to write to Notion docs");
        }
    });
}
