import axios from 'axios';

export default {
  name: 'hentai',
  command: ['hentai'],
  tags: 'Nsfw Menu',
  desc: 'Random hentai video',
  prefix: true,
  owner: true,
  premium: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;

    try {
      
      await conn.sendMessage(chatId, {
        react: { text: "⏳", key: msg.key }
      });

      const res = await axios.get('https://api.vreden.my.id/api/v1/random/hentai');
      const list = Array.isArray(res.data?.result) ? res.data.result : [];

      if (list.length === 0) {
        
        await conn.sendMessage(chatId, {
          react: { text: "", key: msg.key }
        });
        return conn.sendMessage(chatId, { text: '❌ Tidak ada video tersedia.' }, { quoted: msg });
      }

      
      const chosen = list[Math.floor(Math.random() * list.length)];

      await conn.sendMessage(chatId, {
        video: { url: chosen.video_1 },
        caption:
          `*${chosen.title}*\n` +
          `Kategori: ${chosen.category}\n` +
          `Views: ${chosen.views_count}\n` +
          `Share: ${chosen.share_count}\n` +
          `[Link](${chosen.link})`
      }, { quoted: msg });

      
      await conn.sendMessage(chatId, {
        react: { text: "✅", key: msg.key }
      });

    } catch (err) {
      console.error('Hentai API Error:', err?.response?.data ?? err);
      
      await conn.sendMessage(chatId, {
        react: { text: "", key: msg.key }
      });
      await conn.sendMessage(chatId, { text: '❌ Gagal mengambil video dari API.' }, { quoted: msg });
    }
  }
};
