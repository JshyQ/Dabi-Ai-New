import axios from "axios";

export default {
  name: "nhentai",
  command: ["nh"],
  tags: "nsfw",
  desc: "Get a random doujin from nhentai.net with download button",
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
      if (!randomUrl || !/^\/g\/\d+/.test(randomUrl)) throw new Error("Gagal mendapatkan random doujin!");

      const doujinId = randomUrl.match(/\/g\/(\d+)/)?.[1];
      const doujinPage = await axios.get(`https://nhentai.net${randomUrl}`);
      const html = doujinPage.data;

      
      const coverMatch = html.match(/<img[^>]+class="cover"[^>]+src="([^"]+)"/);
      const coverUrl = coverMatch ? coverMatch[1] : null;

      
      const downloadUrl = `https://dl.nhentai.xxx/g/${doujinId}.zip`;

      const replyText = `🎲 Random nhentai:\nID: ${doujinId}\nLink: https://nhentai.net/g/${doujinId}/`;

      
      await conn.sendMessage(chatId, {
        image: { url: coverUrl },
        caption: replyText,
        footer: "Tekan Tombol Dibawah Untuk Mendownload Sebagai ZIP.",
        buttons: [
          {
            buttonId: `.nhdl ${doujinId}`,
            buttonText: { displayText: "⬇️ Download" },
            type: 1
          }
        ]
      }, { quoted: msg });
    } catch (err) {
      await conn.sendMessage(chatId, {
        text: "❌ Gagal mengambil random doujin dari nhentai.net",
        quoted: msg
      });
    }
  }
};
