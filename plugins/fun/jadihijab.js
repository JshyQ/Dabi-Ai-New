export default {
  name: 'jadihijab',
  command: ['jadihijab'],
  tags: 'Fun',
  desc: 'Convert image to hijab using Betabotz API',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    let url = args[0];
    if (!url) {
      return conn.sendMessage(chatId, { text: '❌ Kirim gambar dengan caption .jadihijab atau reply gambar dengan .jadihijab', quoted: msg });
    }
    try {
      let api = `https://api.betabotz.eu.org/api/maker/jadihijab?apikey=Btz-yMor6&url=${encodeURIComponent(url)}`;
      await conn.sendMessage(chatId, { image: { url: api }, caption: '_Berhasil convert ke hijab_' }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
