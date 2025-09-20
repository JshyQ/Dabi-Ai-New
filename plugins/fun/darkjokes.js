export default {
  name: 'darkjokes',
  command: ['darkjokes'],
  tags: 'Menu Fun',
  desc: 'Send random darkjokes wallpaper using Betabotz API',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    try {
      const api = 'https://api.betabotz.eu.org/api/wallpaper/darkjokes?apikey=Btz-yMor6';
      const res = await fetch(api);
      const json = await res.json();
      if (!json || !json.result) {
        return conn.sendMessage(chatId, { text: '❌ Tidak ada hasil dari API.', quoted: msg });
      }
      await conn.sendMessage(chatId, { image: { url: json.result }, caption: '_Random Darkjokes Wallpaper_' }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
