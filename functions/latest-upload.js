// netlify/functions/latest-upload.js

import { getStore } from "@netlify/blobs";

export const handler = async () => {
  try {
    const store = getStore("userupload", {
      siteId: process.env.SITE_ID,
      token: process.env.NETLIFY_API_TOKEN,
      consistency: "strong",
    });

    const result = await store.get("latest");
    if (!result || !result.content) {
      return { statusCode: 404, body: "No image found" };
    }

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: { "Content-Type": result.mimetype },
      body: result.content,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error retrieving latest upload: ${err.message}`,
    };
  }
};
