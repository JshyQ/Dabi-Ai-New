const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'savefile',
  command: ['savefile', 'sf'],
  tags: 'Owner Menu',
  desc: 'Menulis ulang file dengan teks dari pesan yang dikutip',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const senderId = message.key.participant || chatId;
    const mtype = Object.keys(message.message || {})[0];
    const textMessage =
      (mtype === 'conversation' && message.message?.conversation) ||
      (mtype === 'extendedTextMessage' && message.message?.extendedTextMessage?.text) ||
      '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift()?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan path file yang ingin ditulis ulang!' }, { quoted: message });
    }

    const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
    if (!quotedMessage) {
      return conn.sendMessage(chatId, { text: '⚠️ Anda harus mengutip pesan berisi teks untuk menyimpan sebagai file!' }, { quoted: message });
    }

    const baseDir = path.join(__dirname, '../../');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori BaseBot tidak diizinkan!' }, { quoted: message });
    }

    try {
      fs.writeFileSync(filePath, quotedMessage, 'utf8');

      if (filePath.includes('/plugins/')) {
        try {
          delete require.cache[require.resolve(filePath)];
          conn.sendMessage(
            chatId,
            {
              text: `✅ File berhasil disimpan dan plugin telah di-reload!\n📂 *Path:* ${filePath.replace(baseDir + '/', '')}`
            },
            { quoted: message }
          );
        } catch (err) {
          console.error('Gagal me-reload plugin:', err);
          conn.sendMessage(
            chatId,
            {
              text: `⚠️ File berhasil disimpan, tetapi gagal me-reload plugin.\n📂 *Path:* ${filePath.replace(baseDir + '/', '')}`
            },
            { quoted: message }
          );
        }
      } else {
        conn.sendMessage(
          chatId,
          {
            text: `✅ File berhasil disimpan!\n📂 *Path:* ${filePath.replace(baseDir + '/', '')}`
          },
          { quoted: message }
        );
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 3 detik..." }, { quoted: message });

      await new Promise(resolve => setTimeout(resolve, 3000));

      process.exit(1);
    } catch (error) {
      console.error(error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menyimpan file!' }, { quoted: message });
    }
  }
};