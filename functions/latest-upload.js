// netlify/functions/latest-upload.js

import { get } from "@netlify/blobs";

export const handler = async () => {
  try {
    // Načítať najnovší obrázok zo store
    const result = await get("images", "latest");

    if (!result || !result.content) {
      return {
        statusCode: 404,
        body: "No image found",
      };
    }

    // Vytvoríme URL pre Base64 obrázok
    const imgData = `data:${result.mimetype};base64,${result.content}`;
    
    return {
      statusCode: 200,
      body: imgData, // Vrátime Base64 obrázok ako odpoveď
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error retrieving latest upload: ${err.message}`,
    };
  }
};
