import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parse error" });
    }

    const file = files.photo?.[0];
    if (!file) {
      return res.status(400).json({ error: "No photo found" });
    }

    try {
      const formData = new FormData();
      formData.append("chat_id", process.env.CHAT_ID);
      formData.append("photo", fs.createReadStream(file.filepath));

      const telegramRes = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
        { method: "POST", body: formData }
      );

      const result = await telegramRes.json();
      res.status(200).json(result);
    } catch (error) {
      console.error("Send error:", error);
      res.status(500).json({ error: "Failed to send photo" });
    }
  });
}
