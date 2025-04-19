import { set } from "@netlify/blobs";
import Busboy from "busboy";
import { Buffer } from "buffer";

export const config = {
  bodyParser: false,
};

export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: event.headers });
    const fields = {};
    let fileBuffer = null;
    let fileName = null;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
        fileName = filename;
      });
    });

    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on("finish", async () => {
      if (!fileBuffer) {
        return resolve({ statusCode: 400, body: "No file uploaded" });
      }

      try {
        const key = `uploads/${fields.user || "anon"}_${fileName}`;
        await set("uploaded_files", key, fileBuffer);

        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: "File saved to blobs", path: key }),
        });
      } catch (err) {
        resolve({ statusCode: 500, body: `Error: ${err.message}` });
      }
    });

    // Important: decode base64 body
    busboy.end(Buffer.from(event.body, "base64"));
  });
};
