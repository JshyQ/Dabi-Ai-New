const axios = require('axios');

module.exports = {
  name: 'pindl',
  command: ['pindl', 'pinterestdl'],
  tags: 'Download Menu',
  desc: 'Download media dari link Pinterest',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo;
    const url = args[0];

    if (!url || (!url.includes('pinterest.com') && !url.includes('pin.it'))) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Contoh penggunaan:\n${prefix}${commandText} https://www.pinterest.com/pin/123456789`
      }, { quoted: message });
    }

    try {
      const res = await axios.get(`${global.siptzKey}/api/d/pinterest`, {
        params: { url }
      });

      const data = res.data?.data;

      let mediaUrl = Array.isArray(data) ? data[0]?.url : data?.url;

      if (!res.data.status || !mediaUrl) {
        return conn.sendMessage(chatId, {
          text: '❌ Gagal mengambil media dari Pinterest.'
        }, { quoted: message });
      }

      const isVideo = mediaUrl.endsWith('.mp4');

      await conn.sendMessage(chatId, {
        [isVideo ? 'video' : 'image']: { url: mediaUrl },
        caption: `✅ Berhasil mengunduh ${isVideo ? 'video' : 'gambar'} dari Pinterest.`
      }, { quoted: message });

    } catch (err) {
      console.error('Error di plugin pindl:', err);
      return conn.sendMessage(chatId, {
        text: '❌ Terjadi kesalahan saat mengambil data dari API.'
      }, { quoted: message });
    }
  }
};