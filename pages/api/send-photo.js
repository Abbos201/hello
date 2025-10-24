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

  try {
    // ✅ formidable fayllarni o‘qish
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.photo?.[0];
    if (!file) return res.status(400).json({ error: "No photo received" });

    // ✅ Faylni o‘qish
    const fileBuffer = fs.readFileSync(file.filepath);

    // ✅ Telegramga yuborish
    const formData = new FormData();
    formData.append("chat_id", process.env.CHAT_ID);
    formData.append("photo", fileBuffer, file.originalFilename);

    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      }
    );

    const json = await tgRes.json();
    return res.status(200).json(json);
  } catch (err) {
    console.error("Telegram xatosi:", err);
    return res.status(500).json({ error: err.message });
  }
}
