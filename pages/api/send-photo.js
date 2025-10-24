import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const photo = files.photo?.[0];
    if (!photo) return res.status(400).json({ error: "No photo uploaded" });

    try {
      const fileStream = fs.createReadStream(photo.filepath);
      const formData = new FormData();
      formData.append("chat_id", process.env.CHAT_ID);
      formData.append("photo", fileStream);

      const response = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.description || "Failed to send photo");
      }

      res.status(200).json({ ok: true, result: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
