// netlify/functions/latest-upload.js

import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  const { filename } = event.queryStringParameters; // Predpokladajme, že názov súboru je poskytnutý v query parametri

  try {
    const store = getStore({
      name: "userupload", // Rovnaký názov ako pri nahrávaní
      consistency: "strong",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    // Získať obrázok presne podľa názvu, ktorý bol nahraný
    const result = await store.get(filename);

    if (!result || !result.content) {
      return { statusCode: 404, body: "No image found" };
    }

    return {
      statusCode: 200,
      isBase64Encoded: true, // Potrebné pre binárne dáta
      headers: {
        "Content-Type": result.mimetype || "application/octet-stream", // Správne nastavenie MIME typu
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
