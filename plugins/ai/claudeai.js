/***
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 *** - Dev: FongsiDev
 *** - Contact: t.me/dashmodz
 *** - Gmail: fongsiapi@gmail.com & fgsidev@neko2.net
 *** - Group: chat.whatsapp.com/Ke94ex9fNLjE2h8QzhvEiy
 *** - Telegram Group: t.me/fongsidev
 *** - Github: github.com/Fgsi-APIs/RestAPIs/issues/new
 *** - Website: fgsi.koyeb.app
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 ***/

// Scraper By Fgsi

import axios from "axios";
import FormData from "form-data";
import fs from "fs";

class OverchatClient {
  constructor() {
    this.client = axios.create({
      baseURL: "https://widget-api.overchat.ai/v1/chat",
      headers: {
        "authority": "widget-api.overchat.ai",
        "accept": "*/*",
        "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
        "authorization": "Bearer",
        "origin": "https://widget.overchat.ai",
        "referer": "https://widget.overchat.ai/",
        "sec-ch-ua": `"Not A(Brand";v="8", "Chromium";v="132"`,
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": `"Android"`,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "x-device-language": "ms",
        "x-device-platform": "web",
        "x-device-uuid": Buffer.from(String(Date.now())).toString("base64"),
        "x-device-version": "1.0.44",
      },
    });
  }

  async sendMessage({ messages, chatId = "", options = {} }) {
    const body = {
      chatId,
      model: "claude-sonnet-4-20250514",
      messages,
      personaId: "sonnet-4",
      frequency_penalty: 0,
      max_tokens: 4000,
      presence_penalty: 0,
      stream: false,
      temperature: 0.5,
      top_p: 0.95,
      ...options,
    };
    const res = await this.client.post("/completions", body, {
      headers: { "content-type": "application/json" },
    });
    return res.data;
  }

  async sendWithImage(text, filePath, chatId = "") {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    const uploadRes = await this.client.post("/upload", form, {
      headers: form.getHeaders(),
    });
    const fileData = uploadRes.data;
    const body = {
      chatId,
      model: "claude-sonnet-4-20250514",
      messages: [
        {
          role: "user",
          content: text,
          metadata: {
            files: [
              {
                path: fileData.link.split("/")[3],
                link: fileData.link,
                croppedImageLink: fileData.croppedImageLink,
              },
            ],
          },
        },
      ],
      links: [fileData.link],
      personaId: "sonnet-4",
      frequency_penalty: 0,
      max_tokens: 4000,
      presence_penalty: 0,
      stream: false,
      temperature: 0.5,
      top_p: 0.95,
    };
    const res = await this.client.post("/thread", body, {
      headers: { "content-type": "application/json" },
    });
    return res.data;
  }
}

const client = new OverchatClient();

(async () => {
  const res1 = await client.sendMessage({
    messages: [{ role: "user", content: "hai" }],
  });
  console.log("Text only:", res1);

  const res2 = await client.sendWithImage("apa ini", "./tmp/milaait.png");
  console.log("With image:", res2);
})();
