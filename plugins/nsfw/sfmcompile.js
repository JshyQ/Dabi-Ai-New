import axios from 'axios';
import cheerio from 'cheerio';

export default {
  name: 'sfm',
  command: ['sfm'],
  tags: 'Nsfw Menu',
  desc: 'Send a random SFM video from sfmcompile.club, supports keyword search.',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const keyword = args.join(" ").trim().toLowerCase();

    await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

    try {
      
      const response = await axios.get('https://sfmcompile.club/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      

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

     
      console.log("Found videoItems:", videoItems.length);

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
          { text: `❌ Tidak ditemukan video dengan keyword tersebut.\n\nFound total: ${videoItems.length}`, quoted: msg }
        );
      }

     
