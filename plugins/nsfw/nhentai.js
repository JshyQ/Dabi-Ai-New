import axios from "axios";

export default {
  name: "nhentai",
  command: ["nh"],
  tags: "nsfw",
  desc: "Get a random doujin from nhentai.net",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    try {
      
      const response = await axios.get("https://nhentai.net/random/", {
        maxRedirects: 0,
        validateStatus: status => status === 302 
      });

      const randomUrl = response.headers.location;
      if (!randomUrl || !/^\/g\/\d+/.test(randomUrl)) {
        throw new Error("Gagal mendapatkan random doujin!");
      }

      
      const doujinId = randomUrl.match(/\/g\/(\d+)/)?.[1];

      
      
      const pageHtml = (await axios.get(`https://nhentai.net${randomUrl}`)).data;
      const coverMatch = pageHtml.match(/<img[^>]+class="cover"[^>]+src="([^"]+)"/);
      const coverUrl = coverMatch ? coverMatch[1] : null;

      
      const replyText = `🎲 Random nhentai:\nID: ${doujinId}\nLink: https://nhentai.net/g/${doujinId}/`;

      if (coverUrl) {
        await conn.sendMessage(chatId, {
          image: { url: coverUrl },
          caption: replyText
        }, { quoted: msg });
      } else {
        await conn.sendMessage(chatId, { text: replyText }, { quoted: msg });
      }
    } catch (err) {
      await conn.sendMessage(chatId, {
        text: "❌ Gagal mengambil random doujin dari nhentai.net",
        quoted: msg
      });
    }
  }
};
