// netlify/functions/upload-handler.js

import Busboy from "busboy";
import { getStore } from "@netlify/blobs";

export const config = { api: { bodyParser: false } };

export const handler = async (event) => {
  const headers = event.headers;
  const bodyBuffer = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : Buffer.from(event.body, "utf-8");

  return new Promise((resolve) => {
    const busboy = Busboy({ headers });
    let fileBuffer = Buffer.alloc(0);
    let filename = "";
    let mimetype = "";

    busboy.on("file", (_fieldname, file, fname, _enc, mimetypeArg) => {
      filename = fname || "default_filename"; // Zabezpečíme, že filename bude reťazec, ak nie je prítomný
      mimetype = mimetypeArg;

      file.on("data", (chunk) => {
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
      });
    });

    busboy.on("finish", async () => {
      try {
        const store = getStore({
          name: "userupload",
          consistency: "strong",
          siteID: process.env.NETLIFY_SITE_ID,
          token: process.env.NETLIFY_TOKEN,
        });

        // Skontrolujeme, či je filename reťazec
        if (typeof filename !== "string" || filename.trim() === "") {
          throw new Error("Filename must be a valid string");
        }

        await store.set(filename, fileBuffer, { mimetype });

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
