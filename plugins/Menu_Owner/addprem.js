module.exports = {
  name: 'addisPrem',
  command: ['addprem'],
  tags: 'Owner Menu',
  desc: 'Menambahkan pengguna ke status isPremium.',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isOwner(module.exports, conn, message))) return;

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `📌 Gunakan format:\n\n*${prefix}${commandText} @tag 7h*\natau\n*${prefix}${commandText} 628xxxx 7h*`
        }, { quoted: message });
      }

      intDB();
      const db = readDB();

      let targetNumber;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else {
        const raw = args[0].replace(/[^0-9]/g, '');
        if (!raw) return conn.sendMessage(chatId, { text: '❗ Nomor tidak valid!' }, { quoted: message });
        targetNumber = raw + '@s.whatsapp.net';
      }

      const durationInput = args[1];
      const match = durationInput.match(/^(\d+)([hmd])$/);
      if (!match) {
        return conn.sendMessage(chatId, {
          text: `❗ Format durasi salah! Contoh: 7h (jam), 1d (hari), 30m (menit).`
        }, { quoted: message });
      }

      const [_, valueStr, unit] = match;
      const value = parseInt(valueStr);
      let durationMs;

      switch (unit) {
        case 'h': durationMs = value * 3600000; break;
        case 'd': durationMs = value * 86400000; break;
        case 'm': durationMs = value * 60000; break;
        default:
          return conn.sendMessage(chatId, {
            text: '❗ Satuan waktu tidak dikenal.'
          }, { quoted: message });
      }

      const userKey = Object.keys(db.Private).find(key => db.Private[key].Nomor === targetNumber);
      if (!userKey) {
        return conn.sendMessage(chatId, {
          text: `❌ Pengguna tidak ditemukan di database!`
        }, { quoted: message });
      }

      db.Private[userKey].isPremium = {
        isPrem: true,
        time: durationMs,
        activatedAt: Date.now()
      };

      saveDB(db);

      conn.sendMessage(chatId, {
        text: `✅ *${userKey}* (${targetNumber}) sekarang *Premium* selama ${value} ${unit === 'h' ? 'jam' : unit === 'd' ? 'hari' : 'menit'}.`
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin addisPrem.js:', error);
      conn.sendMessage(chatId, {
        text: '⚠️ Terjadi kesalahan saat menambahkan status Premium!'
      }, { quoted: message });
    }
  },
};