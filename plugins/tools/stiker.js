import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { writeExifImg, writeExifVid } from '../../toolkit/exif.js';
import fs from 'fs';

export default {
  name: 'stiker',
  command: ['s'],
  tags: 'Tools Menu',
  desc: 'Membuat sticker',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isImage = quoted?.imageMessage || msg.message?.imageMessage;
    const isVideo = quoted?.videoMessage || msg.message?.videoMessage;

    if (!isImage && !isVideo)
      return conn.sendMessage(chatId, {
        text: 'Balas gambar/video dengan caption *s*' +
              'atau kirim langsung media dengan caption yang sama!'
      }, { quoted: msg });

    let media;
    try {
      media = await downloadMediaMessage({ message: quoted || msg.message }, 'buffer');
      if (!media) throw new Error('Media tidak terunduh!');
    } catch (e) {
      return conn.sendMessage(chatId, { text: `❌ Gagal mengunduh media! ${e.message}` }, { quoted: msg });
    }

    const metadata = { packname: footer, author: msg.pushName };

    try {
      const stickerPath = isImage 
        ? await writeExifImg(media, metadata) 
        : await writeExifVid(media, metadata);

      if (!stickerPath) throw new Error('Gagal membuat stiker!');

      const stickerBuffer = fs.readFileSync(stickerPath);
      await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
    } catch (e) {
      return conn.sendMessage(chatId, { text: `❌ Gagal membuat stiker! ${e.message}` }, { quoted: msg });
    }
  }
};
