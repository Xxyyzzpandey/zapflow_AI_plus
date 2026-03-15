

export async function fetchNotionRows(notionKey: string, databaseId: string): Promise<Record<string, any>[]> {
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;

  try {
    const res = await fetch(url, {
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

    const data = await res.json();

    const results = data.results as any[];

    const rows = results.map((page) => {
      const rowData: Record<string, any> = {};

      const properties = page.properties as Record<string, unknown>;

      for (const key in properties) {
        const prop = properties[key];

        if (typeof prop === "object" && prop !== null) {
          const p = prop as any;

          if (Array.isArray(p.title)) {
            rowData[key] = p.title.map((t: any) => t.text?.content || "").join(" ");
          } else if (Array.isArray(p.rich_text)) {
            rowData[key] = p.rich_text.map((t: any) => t.text?.content || "").join(" ");
          } else if (typeof p.select === "object" && p.select !== null) {
            rowData[key] = p.select.name || null;
          } else if (typeof p.number === "number") {
            rowData[key] = p.number;
          } else {
            rowData[key] = null;
          }
        } else {
          rowData[key] = null;
        }
      }

      return rowData;
    });

    return rows;
  } catch (error) {
    // console.error("❌ Failed to fetch Notion rows:", error);
    throw new Error("Failed to fetch Notion rows");
  }
}
