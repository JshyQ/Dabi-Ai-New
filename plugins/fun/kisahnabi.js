export default {
  name: 'kisahnabi',
  command: ['kisahnabi'],
  tags: 'Fun',
  desc: 'Get Islamic Prophet story',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const nabi = args.join(' ').trim();
    if (!nabi) {
      return conn.sendMessage(chatId, { text: '❌ Masukkan nama nabi!\nContoh: .kisahnabi musa', quoted: msg });
    }
    try {
      let api = `https://api.betabotz.eu.org/api/islamic/kisahnabi?apikey=Btz-yMor6&nabi=${encodeURIComponent(nabi)}`;
      let res = await fetch(api);
      let json = await res.json();
      if (!json || !json.result) {
        return conn.sendMessage(chatId, { text: '❌ Nabi tidak ditemukan atau API error.', quoted: msg });
      }
      const result = json.result;
      let replyText = `*Kisah Nabi ${result.name}*\n\n${result.story}`;
      await conn.sendMessage(chatId, { text: replyText }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
