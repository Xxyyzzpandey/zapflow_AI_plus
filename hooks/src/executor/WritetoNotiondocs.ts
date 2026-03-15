

export async function writeToNotionDocs(
  notionKey: string,
  databaseId: string,
  properties: Record<string, any>
): Promise<Record<string, any>> {
  const url = "https://api.notion.com/v1/pages";

  try {
    // Prepare the formatted properties expected by Notion API
    const formattedProperties: Record<string, any> = {};

    for (const key in properties) {
      const value = properties[key];

      // Simple heuristic to map data types to Notion properties
      if (typeof value === "string") {
        formattedProperties[key] = { rich_text: [{ text: { content: value } }] };
      } else if (typeof value === "number") {
        formattedProperties[key] = { number: value };
      } else if (typeof value === "boolean") {
        formattedProperties[key] = { checkbox: value };
      } else {
        formattedProperties[key] = { rich_text: [{ text: { content: String(value) } }] };
      }
    }

    const body = {
      parent: { database_id: databaseId },
      properties: formattedProperties,
    };

    const res = await fetch(url, {
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

    const data = await res.json();
    return data;
  } catch (error) {
    // console.error("❌ Failed to write to Notion docs:", error);
    throw new Error("Failed to write to Notion docs");
  }
}
