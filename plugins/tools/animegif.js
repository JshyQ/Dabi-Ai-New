export default {
  name: 'animegif',
  command: ['animegif'],
  tags: 'Tools',
  desc: 'Send random anime GIF stickers',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    try {
      const api = 'https://api.betabotz.eu.org/api/sticker/animegif?apikey=Btz-yMor6';
      const res = await fetch(api);
      const json = await res.json();
      if (!json || !json.result) {
        return conn.sendMessage(chatId, { text: '❌ Tidak ada hasil dari API.', quoted: msg });
      }
     
      await conn.sendMessage(chatId, { sticker: { url: json.result }, caption: '_Random Anime GIF Sticker_' }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
