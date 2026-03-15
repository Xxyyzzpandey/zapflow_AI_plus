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
exports.fetchNotionRows = fetchNotionRows;
function fetchNotionRows(notionKey, databaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
        try {
            const res = yield fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${notionKey}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}), // Empty body to query all rows
            });
            if (!res.ok) {
                throw new Error(`Notion API responded with status ${res.status}`);
            }
            const data = yield res.json();
            const results = data.results;
            const rows = results.map((page) => {
                const rowData = {};
                const properties = page.properties;
                for (const key in properties) {
                    const prop = properties[key];
                    if (typeof prop === "object" && prop !== null) {
                        const p = prop;
                        if (Array.isArray(p.title)) {
                            rowData[key] = p.title.map((t) => { var _a; return ((_a = t.text) === null || _a === void 0 ? void 0 : _a.content) || ""; }).join(" ");
                        }
                        else if (Array.isArray(p.rich_text)) {
                            rowData[key] = p.rich_text.map((t) => { var _a; return ((_a = t.text) === null || _a === void 0 ? void 0 : _a.content) || ""; }).join(" ");
                        }
                        else if (typeof p.select === "object" && p.select !== null) {
                            rowData[key] = p.select.name || null;
                        }
                        else if (typeof p.number === "number") {
                            rowData[key] = p.number;
                        }
                        else {
                            rowData[key] = null;
                        }
                    }
                    else {
                        rowData[key] = null;
                    }
                }
                return rowData;
            });
            return rows;
        }
        catch (error) {
            console.error("❌ Failed to fetch Notion rows:", error);
            throw new Error("Failed to fetch Notion rows");
        }
    });
}
