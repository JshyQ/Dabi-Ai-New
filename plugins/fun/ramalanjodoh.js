export default {
  name: 'ramalanjodoh',
  command: ['ramalanjodoh'],
  tags: 'Fun',
  desc: 'Ramalan jodoh',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    
    if (args.length < 8) {
      return conn.sendMessage(chatId, {
        text: '❌ Format salah!\nGunakan contoh:\n.ramalanjodoh Erlan|14|5|2005|Anya|1|2|2005',
        quoted: msg
      });
    }
    const [nama1, tanggal1, bulan1, tahun1, nama2, tanggal2, bulan2, tahun2] = args.join(' ').split('|').map(x => x.trim());
    if (!nama1 || !tanggal1 || !bulan1 || !tahun1 || !nama2 || !tanggal2 || !bulan2 || !tahun2) {
      return conn.sendMessage(chatId, {
        text: '❌ Semua parameter wajib diisi!\nGunakan contoh:\n.ramalanjodoh Erlan|14|5|2005|Anya|1|2|2005',
        quoted: msg
      });
    }
    try {
      const api = `https://api.betabotz.eu.org/api/primbon/ramalanjodoh?nama1=${encodeURIComponent(nama1)}&tanggal1=${encodeURIComponent(tanggal1)}&bulan1=${encodeURIComponent(bulan1)}&tahun1=${encodeURIComponent(tahun1)}&nama2=${encodeURIComponent(nama2)}&tanggal2=${encodeURIComponent(tanggal2)}&bulan2=${encodeURIComponent(bulan2)}&tahun2=${encodeURIComponent(tahun2)}&apikey=Btz-yMor6`;
      const res = await fetch(api);
      const json = await res.json();
      if (!json || !json.result) {
        return conn.sendMessage(chatId, { text: '❌ Tidak ditemukan atau API error.', quoted: msg });
      }
      const result = json.result;
      let reply = `*Ramalan Jodoh*\n\n${result.hasil}\n\n${result.catatan ? result.catatan : ''}`;
      await conn.sendMessage(chatId, { text: reply }, { quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
