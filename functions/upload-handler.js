// netlify/functions/upload.js
import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  // Kontrola, či je metóda POST (alebo PUT) - formData() funguje len pre ne
  if (request.method !== 'POST' && request.method !== 'PUT') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const fileUpload = formData.get("fileUpload"); // Názov poľa vo vašom HTML formulári

    // Validácia: Skontrolujeme, či bol súbor nahraný a či je to Blob/File objekt
    if (!fileUpload || typeof fileUpload === 'string' || !(fileUpload instanceof Blob)) {
      return new Response("No file uploaded or invalid form data", { status: 400 });
    }

    const timestamp = Date.now().toString(); // Použijeme timestamp ako kľúč

    const store = getStore({
      name: "useruploads", // Zvoľte si názov úložiska (store)
      consistency: "strong",
      // siteID a token sú zvyčajne implicitne nastavené Netlify
      // siteID: process.env.NETLIFY_SITE_ID,
      // token: process.env.NETLIFY_TOKEN,
    });

    console.log(`Uploading file: ${fileUpload.name}, type: ${fileUpload.type}, size: ${fileUpload.size}, key: ${timestamp}`);

    // Uložíme súbor priamo (ako Blob/File) a pridáme Content-Type do metadát
    await store.set(timestamp, fileUpload, {
        metadata: {
            contentType: fileUpload.type || 'application/octet-stream', // Uložíme MIME typ
            originalFilename: fileUpload.name // Môžeme uložiť aj pôvodný názov
         }
    });

    // Presmerujeme používateľa späť na stránku, kde je obrázok
    // Použijeme 303 See Other pre presmerovanie po POST požiadavke
    return new Response(null, {
      status: 303,
      headers: {
        // Upravte cestu podľa potreby (kde sa nachádza váš <img> tag)
        Location: "/",
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    // V produkcii neposielajte detailné chyby klientovi
    return new Response(`Upload failed: ${error.message}`, { status: 500 });
  }
};

// Voliteľné: Ak používate Edge Functions, môžete špecifikovať cestu
// export const config = { path: "/api/upload" }; // Alebo iná cesta pre váš upload endpoint