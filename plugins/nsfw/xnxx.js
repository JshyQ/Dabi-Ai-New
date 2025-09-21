import axios from 'axios';

export default {
  name: 'xnxx',
  command: ['xnxx'],
  tags: 'Nsfw Menu',
  desc: 'Send XNXX video',
  prefix: true,
  owner: true,
  premium: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const input = args.join(" ");
    if (!input) {
      return conn.sendMessage(chatId, {
        text: '❌ Masukkan link XNXX yang valid atau keyword!\nContoh: xnxx https://www.xnxx.com/video-xxxx/ atau xnxx japanese',
      }, { quoted: msg });
    }

    let videoPageUrl;

    
    if (/^https?:\/\/(www\.)?xnxx\.com\/video-/.test(input)) {
      videoPageUrl = input;
    } else {
      
      await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });
      try {
        const searchRes = await axios.get('https://api.vreden.my.id/api/v1/search/xnxx', {
          params: { query: input }
        });
        const videos = searchRes.data?.result?.videos;
        if (!videos || videos.length === 0) {
          await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
          return conn.sendMessage(chatId, { text: '❌ Tidak ditemukan video untuk keyword tersebut.', quoted: msg });
        }
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        videoPageUrl = randomVideo.url;
      } catch (err) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: '❌ Gagal mencari video dengan keyword tersebut.', quoted: msg });
      }
    }

  
    try {
      await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

      const res = await axios.get('https://api.vreden.my.id/api/v1/download/xnxx', {
        params: { url: videoPageUrl }
      });
      const result = res.data?.result;
      const videoUrl = result?.download?.high || result?.download?.low;

      if (!videoUrl) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: '❌ Gagal mengambil video dari API, pastikan link benar.', quoted: msg });
      }

      let caption = `*${result.title || "XNXX Video"}*\n[Open on XNXX](${videoPageUrl})`;
      await conn.sendMessage(chatId, {
        video: { url: videoUrl },
        caption: caption
      }, { quoted: msg });

      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error('XNXX API Error:', err?.response?.data ?? err);
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: '❌ Gagal mengambil video dari API.' }, { quoted: msg });
    }
  }
};
