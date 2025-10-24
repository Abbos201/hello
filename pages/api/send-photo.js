import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const file = files.photo?.[0];
      if (!file) return res.status(400).json({ error: "Rasm topilmadi" });

      const data = fs.readFileSync(file.filepath);

      const botToken = process.env.BOT_TOKEN;
      const chatId = process.env.CHAT_ID;

      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

      // ✅ FormData yaratamiz va to‘g‘ri append qilamiz
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("photo", data, { filename: "photo.jpg" });

      // ✅ `node-fetch` bilan yuboramiz
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      res.status(200).json(json);
    } catch (error) {
      console.error("Yuborish xatosi:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
