// netlify/functions/upload-handler.js

import Busboy from "busboy";           // tvoje fungujúce parsovanie
import { getStore } from "@netlify/blobs";  // oficiálny import store

export const config = {
  api: { bodyParser: false },
};

export const handler = async (event) => {
  const headers = event.headers;
  const bodyBuffer = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : Buffer.from(event.body, "utf-8");

  return new Promise((resolve) => {
    const busboy = Busboy({ headers });
    let fileBuffer = Buffer.alloc(0),
        filename = "",
        mimetype = "";

    busboy.on("file", (_field, file, fname, _enc, mimetypeArg) => {
      filename = fname;
      mimetype = mimetypeArg;
      file.on("data", (chunk) => {
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
      });
    });

    busboy.on("finish", async () => {
      try {
        const timestamp = new Date().toISOString();

        // **Získame store**, v ktorom budeme držať posledný upload
        const userUploadStore = getStore("userupload", {
          consistency: "strong",    // optional, ak potrebuješ silnú konzistenciu
        });

        // **Uložíme** blob pod kľúč "latest"
        await userUploadStore.set("latest", {
          filename,
          mimetype,
          content: fileBuffer.toString("base64"),
          timestamp,
        });

        // **Redirect** späť na blobs.html
        resolve({
          statusCode: 302,
          headers: { Location: "/blobs.html" },
        });
      } catch (err) {
        resolve({
          statusCode: 500,
          body: `Error saving blob: ${err.message}`,
        });
      }
    });

    busboy.end(bodyBuffer);
  });
};
