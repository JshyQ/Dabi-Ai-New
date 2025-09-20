import axios from "axios";

export default {
  name: "nhentai",
  command: ["nh"],
  tags: "nsfw",
  desc: "Get a random doujin from nhentai.net/nhentai.to (with fallback API)",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;

    const sendDoujin = async (id, coverUrl) => {
      const replyText = `🎲 Random nhentai:\nID: ${id}\nLink: https://nhentai.net/g/${id}/\nMirror: https://nhentai.to/g/${id}/`;
      await conn.sendMessage(
        chatId,
        {
          image: { url: coverUrl },
          caption: replyText,
          footer: "Press the 'Download' button to get the doujin as ZIP.",
          buttons: [
            {
              buttonId: `.nhdl ${id}`,
              buttonText: { displayText: "⬇️ Download" },
              type: 1
            }
          ]
        },
        { quoted: msg }
      );
    };

    
    try {
      const response = await axios.get("https://nhentai.net/random/", {
        maxRedirects: 0,
        validateStatus: status => status === 302,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://nhentai.net/"
        }
      });

      const randomUrl = response.headers.location;
      if (!randomUrl || !/^\/g\/\d+/.test(randomUrl)) throw new Error("No redirect");

      const doujinId = randomUrl.match(/\/g\/(\d+)/)?.[1];

      const pageHtml = (
        await axios.get(`https://nhentai.net${randomUrl}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
          }
        })
      ).data;

      const coverMatch = pageHtml.match(
        /<img[^>]+class="cover"[^>]+src="([^"]+)"/
      );
      const coverUrl = coverMatch ? coverMatch[1] : null;

      await sendDoujin(doujinId, coverUrl);
      return;
    } catch (err) {}

    
    try {
      const response = await axios.get("https://nhentai.to/random/", {
        maxRedirects: 0,
        validateStatus: status => status === 302,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://nhentai.to/"
        }
      });

      const randomUrl = response.headers.location;
      if (!randomUrl || !/^\/g\/\d+/.test(randomUrl)) throw new Error("No redirect");

      const doujinId = randomUrl.match(/\/g\/(\d+)/)?.[1];

      const pageHtml = (
        await axios.get(`https://nhentai.to${randomUrl}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
          }
        })
      ).data;

      const coverMatch = pageHtml.match(
        /<img[^>]+class="cover"[^>]+src="([^"]+)"/
      );
      const coverUrl = coverMatch ? coverMatch[1] : null;

      await sendDoujin(doujinId, coverUrl);
      return;
    } catch (err) {}

    
    try {
      const api = await axios.get("https://api.nhentai.xxx/galleries/random");
      const gallery = api.data;
      if (!gallery || !gallery.id) throw new Error("Invalid API result");

      const doujinId = gallery.id;
      const coverType = gallery.images.cover.t === "j" ? "jpg" : "png";
      const coverUrl = `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${coverType}`;

      await sendDoujin(doujinId, coverUrl);
      return;
    } catch (err2) {}

    await conn.sendMessage(
      chatId,
      {
        text:
          "❌ Gagal mengambil random doujin dari nhentai.net, nhentai.to, maupun API fallback.",
        quoted: msg
      }
    );
  }
};
