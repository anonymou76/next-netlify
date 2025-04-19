// netlify/functions/latest-upload.js

import { getStore } from "@netlify/blobs";

export const handler = async () => {
  try {
    // Získame store so silnou konzistenciou a správnou konfiguráciou
    const store = getStore("userupload", {
      siteId: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_API_TOKEN,
      consistency: "strong",
    });

    // Načítame posledný upload
    const result = await store.get("latest");

    if (!result || !result.content) {
      return {
        statusCode: 404,
        body: "No image found",
      };
    }

    // Vracia base64 telo ako binárny obraz so správnym Content-Type
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": result.mimetype,
      },
      body: result.content,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error retrieving latest upload: ${err.message}`,
    };
  }
};
