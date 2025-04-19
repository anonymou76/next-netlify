import { getStore } from "@netlify/blobs";

export const handler = async () => {
  try {
    // Načítanie Netlify Blobs store
    const userUploadStore = getStore({
      name: "UserUpload",
      consistency: "strong",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    // Získanie všetkých blobov zo store
    const userUploadBlobs = await userUploadStore.list();

    // Získanie kľúčov všetkých uploadov
    const allUploads = userUploadBlobs.blobs.map((blob) => blob.key);

    // Získanie najnovšieho uploadu
    const latestUploadKey = allUploads.sort().pop();
    
    if (!latestUploadKey) {
      return {
        statusCode: 404,
        body: "No uploads found",
      };
    }

    const userUploadBlob = await userUploadStore.get(latestUploadKey, { type: "stream" });

    if (!userUploadBlob) {
      return {
        statusCode: 404,
        body: "Upload not found",
      };
    }

    // Vrátenie blobu ako odpoveď
    return {
      statusCode: 200,
      body: userUploadBlob,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error fetching upload: ${err.message}`,
    };
  }
};
