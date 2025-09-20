import axios from 'axios';
import cheerio from 'cheerio';

export default {
  name: 'rule34',
  command: ['rule34', 'rule'],
  tags: 'Nsfw Menu',
  desc: 'Cari gambar random dari rule34 berdasarkan tag',
  prefix: true,
  premium: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo
    const q = args.join(' ')
    if (!q) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}rule34 neko` }, { quoted: msg })
    try {
      const { data } = await axios.get(`https://rule34.xxx/index.php?page=post&s=list&tags=${encodeURIComponent(q)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const $ = cheerio.load(data)
      const posts = $('#post-list .thumb')
      if (!posts.length) return conn.sendMessage(chatId, { text: 'Tidak ditemukan gambar dengan tag itu' }, { quoted: msg })
      const thumb = posts.eq(Math.floor(Math.random() * posts.length))
      const page = 'https://rule34.xxx' + thumb.find('a').attr('href')
      const det = await axios.get(page, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const $$ = cheerio.load(det.data)
      const image = $$('img#image').attr('src')
      if (!image) return conn.sendMessage(chatId, { text: 'Gagal mengambil gambar' }, { quoted: msg })
      await conn.sendMessage(chatId, { image: { url: image }, caption: `Tag: ${q}\nLink: ${page}` }, { quoted: msg })
    } catch (e) {
      conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg })
    }
  }
}
