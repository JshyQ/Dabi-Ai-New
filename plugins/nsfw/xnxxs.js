import axios from "axios";


const searchSessions = {};

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
      return conn.sendMessage(chatId, { text: '❌ Masukkan keyword!\nContoh: .xnxxs anal' }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

    try {
      const api = `https://api.lolhuman.xyz/api/xnxxsearch?apikey=0a356668979c77065fcf741b&query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(api);

      if (!data || data.status !== 200 || !data.result || data.result.length === 0) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: "❌ Tidak ditemukan video.", quoted: msg });
      }

      const results = data.result.slice(0, 5);
      let listText = `*Hasil pencarian untuk:* _${query}_\n\n`;
      results.forEach((vid, i) => {
        listText += `${i + 1}. *${vid.title}*\nUploader: ${vid.uploader}\nDurasi: ${vid.duration}\nViews: ${vid.views}\nBalas dengan *${i + 1}* untuk download video ini\n\n`;
      });

    
      searchSessions[msg.key.id] = results;

      await conn.sendMessage(chatId, { text: listText }, { quoted: msg });
      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (e) {
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: "❌ Gagal mengambil hasil pencarian.", quoted: msg });
    }
  },
  
  searchSessions,
};
