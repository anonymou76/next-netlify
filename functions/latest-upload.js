// netlify/functions/latest-upload.js

import { getStore } from "@netlify/blobs";

export const handler = async () => {
  try {
    const store = getStore({
      name: "userupload",
      consistency: "strong",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    const result = await store.get("latest");

    if (!result || !result.content) {
      return { statusCode: 404, body: "No image found" };
    }

    // Získať MIME typ z metadát uloženého súboru
    const contentType = result.metadata?.mimetype || "application/octet-stream";

    return {
      statusCode: 200,
      isBase64Encoded: true, // Potrebné pre binárne dáta
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
      body: result.content.toString("base64"), // Vráti obrázok ako base64
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error: ${err.message}`,
    };
  }
};
