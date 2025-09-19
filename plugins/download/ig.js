import axios from 'axios';

export default {
  name: 'instagram',
  command: ['instagram', 'ig', 'igdl', 'instegrem', 'insta'],
  tags: 'Download Menu',
  desc: 'Mengunduh video atau foto dari Instagram',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!args || (Array.isArray(args) && !args[0])) {
        return conn.sendMessage(chatId, {
          text: `Masukkan URL Instagram! Contoh: *${prefix}${commandText} https://www.instagram.com/p/C1Ck8sENM94/*`
        }, { quoted: msg });
      }

      const url = Array.isArray(args) ? args[0] : args;
      if (!url.match(/https?:\/\/(?:www\.)?instagram\.[a-z\.]{2,6}\/[\w\-\.]+(\/[^\s]*)?/i)) {
        return conn.sendMessage(chatId, { text: 'URL tidak valid! Pastikan itu adalah tautan Instagram.' }, { quoted: msg });
      }

      await conn.sendMessage(chatId, { text: '⏳ Sedang memproses, mohon tunggu...' }, { quoted: msg });

      // Call Nekolabs API
      const res = await axios.get('https://api.nekolabs.my.id/downloader/instagram', {
        params: { url }
      });

      const media = res.data?.data?.[0];

      if (!media) {
        return conn.sendMessage(chatId, { text: 'Media tidak ditemukan atau URL salah.' }, { quoted: msg });
      }

      const fileName = `${media.title?.replace(/[\/:*?"<>|]/g, '') || 'instagram_1'}.mp4`;
      const caption = media.description || 'Video Instagram';

      await conn.sendMessage(chatId, {
        video: { url: media.url },
        mimetype: 'video/mp4',
        fileName,
        caption
      }, { quoted: msg });

    } catch {
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat memproses permintaan. Coba lagi nanti!' }, { quoted: msg });
    }
  }
};
