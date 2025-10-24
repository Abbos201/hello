import formidable from "formidable";
import fs from "fs";
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

    const file = files.photo[0];
    const data = fs.readFileSync(file.filepath);

    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: new FormData()
          .append("chat_id", chatId)
          .append("photo", new Blob([data]), "photo.jpg"),
      });

      const json = await response.json();
      res.status(200).json(json);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
