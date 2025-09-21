import axios from "axios";

export default {
  name: "xnxxs",
  command: ["xnxxs"],
  tags: "Nsfw Menu",
  desc: "Search XNXX videos",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const query = args.join(" ");

    if (!query) {
      return conn.sendMessage(
        chatId,
        { text: '❌ Masukkan keyword untuk pencarian!\nContoh: .xnxxs anal' },
        { quoted: msg }
      );
    }

    await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

    try {
      const api = `https://api.lolhuman.xyz/api/xnxxsearch?apikey=ce56fdf6eed4efacf91050ea&query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(api);

      if (!data || data.status !== 200 || !data.result || data.result.length === 0) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: "❌ Tidak ditemukan video dengan keyword tersebut.", quoted: msg });
      }

      
      const results = data.result.slice(0, 3);
      for (const vid of results) {
        let caption = `*${vid.title}*\nDuration: ${vid.duration}\nViews: ${vid.views}\nUploader: ${vid.uploader}\n[🔗 Watch](${vid.link})`;
        await conn.sendMessage(
          chatId,
          {
            image: { url: vid.thumbnail },
            caption,
          },
          { quoted: msg }
        );
      }

      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (e) {
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: "❌ Gagal mengambil hasil pencarian.", quoted: msg });
    }
  },
};
