import axios from "axios";

export default {
  name: "resep",
  command: ["resep"],
  tags: "Tools",
  desc: "Cari resep masakan",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const query = args.join(" ");
    if (!query) {
      return conn.sendMessage(
        chatId,
        { text: "❌ Masukkan nama masakan!\nContoh: .resep nasi goreng" },
        { quoted: msg }
      );
    }

    await conn.sendMessage(chatId, { react: { text: "🍳", key: msg.key } });

    try {
      const apiUrl = `https://api.siputzx.my.id/api/s/resep?query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl, {
        headers: {
          'api_key': 'ce56fdf6eed4efacf91050ea'
        }
      });

      if (!data || !data.result || !Array.isArray(data.result) || data.result.length === 0) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        return conn.sendMessage(chatId, { text: "❌ Resep tidak ditemukan untuk kata kunci tersebut.", quoted: msg });
      }

      
      const resep = data.result[0];
      let resepText = `🍛 *${resep.title}*\n\n`;
      if (resep.thumb) resepText += `Gambar: ${resep.thumb}\n\n`;
      if (resep.serving) resepText += `Porsi: ${resep.serving}\n`;
      if (resep.times) resepText += `Waktu masak: ${resep.times}\n`;
      if (resep.difficulty) resepText += `Kesulitan: ${resep.difficulty}\n`;
      if (resep.author) resepText += `Pembuat: ${resep.author}\n`;
      if (resep.desc) resepText += `Deskripsi: ${resep.desc}\n\n`;
      if (resep.ingredient && resep.ingredient.length) {
        resepText += `*Bahan-bahan:*\n${resep.ingredient.map((b, i) => `${i+1}. ${b}`).join('\n')}\n\n`;
      }
      if (resep.step && resep.step.length) {
        resepText += `*Langkah-langkah:*\n${resep.step.map((b, i) => `${i+1}. ${b}`).join('\n')}`;
      }

      await conn.sendMessage(chatId, { text: resepText }, { quoted: msg });
      await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (e) {
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, { text: "❌ Gagal mengambil data resep.", quoted: msg });
    }
  },
};
