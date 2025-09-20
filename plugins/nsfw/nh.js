export default {
  name: 'nhentai-search',
  command: ['nh'],
  tags: 'Tools',
  desc: 'Search nhentai',
  prefix: true,
  owner: false,
  premium: true,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const query = args.join(' ').trim();
    if (!query) {
      return conn.sendMessage(chatId, { text: '❌ Masukkan keyword pencarian!\nContoh: .nh milf', quoted: msg });
    }

    
    await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

    try {
      const api = `https://api.betabotz.eu.org/api/webzone/nhentai-search?query=${encodeURIComponent(query)}&apikey=Btz-yMor6`;
      const res = await fetch(api);

      
      if (!res.ok) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: `❌ Gagal menghubungi API (Status: ${res.status}).`, quoted: msg });
      }

      const json = await res.json();

      if (!json || !json.result || !Array.isArray(json.result) || json.result.length === 0) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: '❌ Tidak ditemukan hasil untuk keyword tersebut.', quoted: msg });
      }

      const result = json.result[0];

      let reply = `*NHentai Search Result*\n\nTitle: ${result.title}\nID: ${result.id}\nLink: ${result.link}\nCover: ${result.cover}`;

      
      if (!result.cover || !/^https?:\/\//.test(result.cover)) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: reply + '\n\n❌ Cover image tidak ditemukan.', quoted: msg });
      }

      await conn.sendMessage(chatId, { image: { url: result.cover }, caption: reply }, { quoted: msg });
      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message || error}`, quoted: msg });
    }
  }
};
