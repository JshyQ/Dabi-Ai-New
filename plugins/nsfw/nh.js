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
    const query = args.join(' ');
    if (!query) {
      return conn.sendMessage(chatId, { text: '❌ Masukkan keyword pencarian!\nContoh: .nh milf', quoted: msg });
    }
    try {
      const api = `https://api.betabotz.eu.org/api/webzone/nhentai-search?query=${encodeURIComponent(query)}&apikey=Btz-yMor6`;
      const res = await fetch(api);
      const json = await res.json();
      if (!json || !json.result || !json.result.length) {
        return conn.sendMessage(chatId, { text: '❌ Tidak ditemukan hasil untuk keyword tersebut.', quoted: msg });
      }
      
      const result = json.result[0]; 
      let reply = `*NHentai Search Result*\n\nTitle: ${result.title}\nID: ${result.id}\nLink: ${result.link}\nCover: ${result.cover}`;
      await conn.sendMessage(chatId, { image: { url: result.cover }, caption: reply }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
