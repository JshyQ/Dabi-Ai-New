import axios from 'axios';
import cheerio from 'cheerio';

export default {
  name: 'sfm',
  command: ['sfm'],
  tags: 'Nsfw Menu',
  desc: 'Send a random SFM video from sfmcompile.club, supports keyword search.',
  prefix: true,
  owner: false,
  premium: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const keyword = args.join(" ").trim().toLowerCase();

    
    await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

    try {
      
      const response = await axios.get('https://sfmcompile.club/');
      const $ = cheerio.load(response.data);

      
      const videoItems = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text() || "";
        if (href && href.startsWith('/video/') && title) {
          videoItems.push({
            url: `https://sfmcompile.club${href}`,
            title: title.toLowerCase()
          });
        }
      });

      
      let filteredVideos = videoItems;
      if (keyword) {
        filteredVideos = videoItems.filter(video =>
          video.title.includes(keyword)
        );
      }

      if (filteredVideos.length === 0) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(
          chatId,
          { text: '❌ Tidak ditemukan video dengan keyword tersebut.', quoted: msg }
        );
      }

      
      const randomVideo = filteredVideos[Math.floor(Math.random() * filteredVideos.length)];
      const vidPage = await axios.get(randomVideo.url);
      const $$ = cheerio.load(vidPage.data);
      let videoSrc = $$('video source').attr('src') || $$('video').attr('src');

      if (!videoSrc) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(
          chatId,
          { text: '❌ Tidak dapat menemukan video pada halaman.', quoted: msg }
        );
      }

      
      videoSrc = videoSrc.startsWith('http') ? videoSrc : `https://sfmcompile.club${videoSrc}`;

      
      await conn.sendMessage(chatId, {
        video: { url: videoSrc },
        caption: randomVideo.title
      }, { quoted: msg });

      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error('SFM API Error:', err?.response?.data ?? err);
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(
        chatId,
        { text: '❌ Gagal mengambil video dari website.', quoted: msg }
      );
    }
  }
};
