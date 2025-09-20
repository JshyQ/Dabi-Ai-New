import axios from "axios";

export default {
  name: "nhentai-croxyproxy",
  command: ["nhproxy", "nh"],
  tags: "nsfw",
  desc: "Get a random doujin from nhentai.net via croxyproxy.com (for blocked regions)",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;

    try {
     
      const croxyUrl = "https://www.croxyproxy.com/?url=https://nhentai.net/random/";
      const croxyRes = await axios.get(croxyUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
        }
      });

      const html = croxyRes.data;

      
      const match = html.match(/<meta property="og:url" content="https:\/\/nhentai\.net\/g\/(\d+)\//);
      const doujinId = match ? match[1] : null;
      if (!doujinId) {
        throw new Error("Gagal menemukan ID doujin!");
      }

      
      let coverUrl = `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`;

      
      try {
        const api = await axios.get(`https://api.nhentai.xxx/gallery/${doujinId}`);
        const gallery = api.data;
        const coverType = gallery.images.cover.t === "j" ? "jpg" : "png";
        coverUrl = `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${coverType}`;
      } catch (e) {
        
      }

      const replyText = `🎲 Random nhentai (via CroxyProxy):\nID: ${doujinId}\nLink: https://nhentai.net/g/${doujinId}/`;

      
      await conn.sendMessage(
        chatId,
        {
          image: { url: coverUrl },
          caption: replyText,
          footer: "Press the 'Download' button to get the doujin as ZIP.",
          buttons: [
            {
              buttonId: `.nhdl ${doujinId}`,
              buttonText: { displayText: "⬇️ Download" },
              type: 1
            }
          ]
        },
        { quoted: msg }
      );
    } catch (err) {
      await conn.sendMessage(chatId, {
        text: "❌ Gagal mengambil random doujin melalui CroxyProxy.",
        quoted: msg
      });
    }
  }
};
