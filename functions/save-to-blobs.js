import { set } from "@netlify/blobs";

export const handler = async (event) => {
  const { message, user } = JSON.parse(event.body);

  await set("feedbacks", user || "anon", { message });

  return {
    statusCode: 200,
    body: "Saved to blobs",
  };
};
