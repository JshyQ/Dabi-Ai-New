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
     
      if (!url.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[a-zA-Z0-9_-]+\/?/i)) {
        return conn.sendMessage(chatId, { text: 'URL tidak valid! Pastikan itu adalah tautan Instagram post, reel, atau story.' }, { quoted: msg });
      }

      await conn.sendMessage(chatId, { text: '⏳ Sedang memproses, mohon tunggu...' }, { quoted: msg });

   
      const res = await axios.post('https://api.nekolabs.my.id/downloader/instagram', 
        { url: url }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' // Good practice to include a UA
          }
        }
      );

      
      if (!res.data.success || !res.data.data || res.data.data.length === 0) {
        throw new Error('API returned no media data.');
      }

      const mediaArray = res.data.data;
      
      
      for (const media of mediaArray) {
      
        const isVideo = media.type?.toLowerCase() === 'video' || media.url?.match(/\.mp4$/i);
        
        const fileName = `instagram_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
        const caption = media.caption || `Instagram ${isVideo ? 'Video' : 'Photo'}`;

        if (isVideo) {
          await conn.sendMessage(chatId, {
            video: { url: media.url },
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: caption
          }, { quoted: msg });
        } else {
          await conn.sendMessage(chatId, {
            image: { url: media.url },
            caption: caption
          }, { quoted: msg });
        }
      }

    } catch (error) {
      console.error('Instagram DL Error:', error);
     
      let errorMessage = 'Terjadi kesalahan saat memproses permintaan.';
      if (error.response?.status === 404) {
        errorMessage = 'Media tidak ditemukan atau URL salah.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      conn.sendMessage(msg.key.remoteJid, { text: errorMessage }, { quoted: msg });
    }
  }
};
