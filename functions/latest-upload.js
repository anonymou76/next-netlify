// netlify/functions/latest-upload.js
import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  try {
    const store = getStore({
      name: "useruploads", // Musí byť rovnaké meno ako v upload funkcii!
      consistency: "strong",
      // siteID: process.env.NETLIFY_SITE_ID, // Implicitné
      // token: process.env.NETLIFY_TOKEN,   // Implicitné
    });

    // Získame zoznam všetkých blobov v úložisku
    const { blobs } = await store.list({ prefix: '', directories: false }); // Získame len súbory

    if (!blobs || blobs.length === 0) {
      console.log("No blobs found in store 'useruploads'.");
      return new Response("No uploads found", { status: 404 });
    }

    // Extrahujeme kľúče a zoradíme ich (predpokladáme, že kľúče sú stringy timestampov)
    // Jednoduché triedenie stringov by malo fungovať pre Date.now().toString()
    const sortedKeys = blobs.map(blob => blob.key).sort();

    // Získame najnovší kľúč (posledný v zoradenom poli)
    const latestKey = sortedKeys[sortedKeys.length - 1];
    console.log(`Found ${blobs.length} blobs. Latest key: ${latestKey}`);

    // Načítame najnovší blob spolu s jeho metadátami
    // Použijeme { type: 'blob' } pre získanie Blob objektu
    const latestBlobInfo = await store.get(latestKey, { type: 'blob', metadata: true });

    if (!latestBlobInfo || !latestBlobInfo.blob) {
      console.error(`Blob data for key ${latestKey} not found after listing.`);
      return new Response("Latest upload data not found", { status: 404 });
    }

    const blobData = latestBlobInfo.blob; // Toto je Blob objekt
    // Získame Content-Type z metadát, ktoré sme uložili pri uploade
    const contentType = latestBlobInfo.metadata?.contentType || 'application/octet-stream';
    console.log(`Returning blob with key ${latestKey}, Content-Type: ${contentType}, Size: ${blobData.size}`);


    // Vrátime Response priamo s Blob objektom a správnym Content-Type
    // Prehliadač by mal byť schopný spracovať tieto dáta v <img> tagu
    return new Response(blobData, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Length': blobData.size.toString(), // Pridanie dĺžky obsahu
            // Môžete pridať aj cache hlavičky, ak chcete
            // 'Cache-Control': 'public, max-age=60' // Napr. cache na 60 sekúnd
        }
    });

  } catch (error) {
    console.error("Retrieve error:", error);
    return new Response(`Error retrieving latest upload: ${error.message}`, { status: 500 });
  }
};

// Voliteľné: Ak používate Edge Functions, cesta musí zodpovedať src v <img>
// export const config = { path: "/.netlify/functions/latest-upload" };