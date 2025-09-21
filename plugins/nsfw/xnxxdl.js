import axios from "axios";

export default {
  name: "xnxxdl",
  command: ["xnxxdl"],
  tags: "Nsfw Menu",
  desc: "Download XNXX video by link
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const url = args[0];

    if (!url || !/^https?:\/\/(www\.)?xnxx\.com\/video-/.test(url)) {
      return conn.sendMessage(
        chatId,
        {
          text: '❌ Masukkan link XNXX yang valid!\nContoh: .xnxxdl https://www.xnxx.com/video-uy5a73b/mom_is_horny_-_brooklyn',
        },
        { quoted: msg }
      );
    }

    await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

    try {
      const api = `https://api.lolhuman.xyz/api/xnxx?apikey=0a356668979c77065fcf741b&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(api);

      if (!data || data.status !== 200 || !data.result) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: "❌ Tidak dapat mengambil data dari API.", quoted: msg });
      }

      const vid = data.result;
      let caption = `*${vid.title}*\nDuration: ${vid.duration}\nViews: ${vid.view}\nLikes: ${vid.like} | Dislikes: ${vid.dislike}\nRating: ${vid.rating}\nTags: ${vid.tag.join(', ')}\nDescription: ${vid.description}\n\n*Download Links:*\n`;

      for (const l of vid.link) {
        caption += `• ${l.type}: ${l.link}\n`;
      }

      await conn.sendMessage(
        chatId,
        {
          image: { url: vid.thumbnail },
          caption,
        },
        { quoted: msg }
      );
      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
    } catch (e) {
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: "❌ Gagal mengambil link download.", quoted: msg });
    }
  },
};
