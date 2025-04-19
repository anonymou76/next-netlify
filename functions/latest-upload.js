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

    // Tu sa robí dôležitý krok - parsovanie JSON
    const parsed = JSON.parse(result.content);

    if (!parsed.content || !parsed.mimetype) {
      return { statusCode: 404, body: "Invalid blob data" };
    }

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": parsed.mimetype,
      },
      body: parsed.content,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error retrieving latest upload: ${err.message}`,
    };
  }
};
