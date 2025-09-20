export default {
  name: 'jadihitam',
  command: ['jadihitam'],
  tags: 'Fun',
  desc: 'Convert image to black & white using Betabotz API',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    let url = args[0];
    if (!url) {
      return conn.sendMessage(chatId, { text: '❌ Kirim gambar dengan caption .jadihitam atau reply gambar dengan .jadihitam', quoted: msg });
    }
    try {
      let api = `https://api.betabotz.eu.org/api/maker/jadihitam?apikey=Btz-yMor6&url=${encodeURIComponent(url)}`;
      await conn.sendMessage(chatId, { image: { url: api }, caption: '_Berhasil convert ke hitam putih_' }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
