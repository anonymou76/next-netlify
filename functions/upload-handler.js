import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  const formData = new URLSearchParams(event.body);
  
  // Získanie súboru z form-data
  const fileUpload = formData.get("fileUpload");

  // Získanie timestampu
  const timestamp = Date.now();

  // Načítanie Netlify Blobs store
  const userUploadStore = getStore({
    name: "UserUpload",
    consistency: "strong",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_TOKEN,
  });

  try {
    // Uloženie súboru do store
    await userUploadStore.set(timestamp.toString(), fileUpload);

    // Presmerovanie späť na hlavnú stránku
    return {
      statusCode: 303,
      headers: {
        Location: "/",
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error uploading file: ${err.message}`,
    };
  }
};
