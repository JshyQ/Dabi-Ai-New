import axios from "axios";

export default {
  name: "caristicker",
  command: ["caristicker"],
  tags: "Tools",
  desc: "Cari Stickerly",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const query = args.join(" ");
    if (!query) {
      return conn.sendMessage(
        chatId,
        { text: "❌ Masukkan keyword pencarian!\nContoh: .caristicker anime" },
        { quoted: msg }
      );
    }

    await conn.sendMessage(chatId, { react: { text: "🔎", key: msg.key } });

    try {
      const api = `https://api.siputzx.my.id/api/sticker/stickerly-search?query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(api, {
        headers: { "api_key": "ce56fdf6eed4efacf91050ea" }
      });

      if (!data || !data.result || data.result.length === 0) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: "❌ Tidak ada sticker ditemukan.", quoted: msg });
      }

      
      const results = data.result.slice(0, 5);
      for (const pack of results) {
        let caption = `*${pack.title}*\nAuthor: ${pack.author}\nTotal Sticker: ${pack.stickers}\n[🔗 Open Stickerly](${pack.url})`;

        await conn.sendMessage(
          chatId,
          {
            image: { url: pack.image },
            caption,
          },
          { quoted: msg }
        );
      }

      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (e) {
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: "❌ Gagal mengambil hasil pencarian sticker.", quoted: msg });
    }
  },
};
