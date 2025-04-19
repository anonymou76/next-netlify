import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const formData = new URLSearchParams(event.body);
  const fileUpload = formData.get("fileUpload");

  if (!fileUpload) {
    return {
      statusCode: 400,
      body: "No file uploaded",
    };
  }

  const timestamp = Date.now();

  const userUploadStore = getStore({
    name: "UserUpload",
    consistency: "strong",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_TOKEN,
  });

  try {
    // Predpokladáme, že 'fileUpload' je reťazec (napr. Base64 encoded data)
    // Ak odosielaš FormData s reálnym súborom, budeš musieť použiť knižnicu ako 'busboy' alebo 'formidable'
    // na jeho spracovanie a získanie obsahu ako Buffer alebo Blob.
    // Pre jednoduchosť predpokladáme, že posielaš priamo obsah ako reťazec.
    await userUploadStore.set(timestamp.toString(), fileUpload);

    return {
      statusCode: 303,
      headers: {
        Location: "/",
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error saving blob: ${err.message}`,
    };
  }
};