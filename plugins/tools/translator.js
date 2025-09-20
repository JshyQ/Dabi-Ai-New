export default {
  name: 'translate',
  command: ['translate'],
  tags: 'Tools',
  desc: 'Translate text',
  prefix: true,
  owner: false,
  premium: false,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
   
    if (!args.length) {
      return conn.sendMessage(chatId, { text: '❌ Format salah!\nGunakan: .translate <text>|<lang>\nContoh: .translate aku|en', quoted: msg });
    }
    const params = args.join(' ').split('|');
    if (params.length < 2) {
      return conn.sendMessage(chatId, { text: '❌ Format salah!\nGunakan: .translate <text>|<lang>', quoted: msg });
    }
    const text = params[0].trim();
    const lang = params[1].trim();
    if (!text || !lang) {
      return conn.sendMessage(chatId, { text: '❌ Teks dan bahasa wajib diisi!\nContoh: .translate aku|en', quoted: msg });
    }
    try {
      const api = `https://api.betabotz.eu.org/api/tools/translate?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}&apikey=Btz-yMor6`;
      const res = await fetch(api);
      const json = await res.json();
      if (!json || !json.result) {
        return conn.sendMessage(chatId, { text: '❌ Tidak ada hasil dari API.', quoted: msg });
      }
      await conn.sendMessage(chatId, { text: `*Hasil translate:*\n${json.result}`, quoted: msg });
    } catch (error) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}`, quoted: msg });
    }
  }
}
