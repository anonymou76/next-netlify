// netlify/functions/get-latest-image.js

import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  try {
    const store = getStore({
      name: "userupload", // Musí byť rovnaké meno ako v upload-handler.js
      consistency: "strong",
      siteID: process.env.NETLIFY_SITE_ID, // Potrebné, ak ich používate v upload-handler.js
      token: process.env.NETLIFY_TOKEN,   // Potrebné, ak ich používate v upload-handler.js
    });

    // Načítame blob s fixným kľúčom "latest"
    const blobDataString = await store.get("latest");

    if (!blobDataString) {
      return {
        statusCode: 404,
        body: "No upload found with key 'latest'.",
      };
    }

    // Blob obsahuje JSON string, musíme ho parsovať
    const blobData = JSON.parse(blobDataString);

    // Dekódujeme base64 obsah späť na binárne dáta (Buffer)
    const imageBuffer = Buffer.from(blobData.content, "base64");

    // Vrátime obrázok s príslušnými hlavičkami
    return {
      statusCode: 200,
      headers: {
        "Content-Type": blobData.mimetype, // Použijeme uložený mimetype
        "Content-Length": imageBuffer.length.toString(),
        // Voliteľné: Ak chcete, aby prehliadač navrhol stiahnutie súboru s pôvodným názvom:
        // 'Content-Disposition': `inline; filename="${blobData.filename}"`
      },
      body: imageBuffer.toString("base64"), // Pre binárne dáta v Netlify funkciách musíme vrátiť base64 string
      isBase64Encoded: true, // A nastaviť tento flag na true
    };

  } catch (err) {
    console.error("Error retrieving blob:", err); // Logovanie chyby pre debugovanie
    return {
      statusCode: 500,
      body: `Error retrieving blob: ${err.message}`,
    };
  }
};

// Nepotrebujete 'export const config', Netlify funkcie štandardne spracujú telo požiadavky.
// Konfigurácia `api: { bodyParser: false }` je relevantná len pre upload handler kvôli Busboy.