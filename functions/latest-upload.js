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

    // Parsujeme JSON, aby sme dostali pôvodné polia
    const data = JSON.parse(result.content);

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": data.mimetype,
      },
      body: data.content,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error retrieving latest upload: ${err.message}`,
    };
  }
};
