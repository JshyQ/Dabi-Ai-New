export default {
  name: 'create',
  command: ['create'],
  tags: 'Info Menu',
  desc: 'Membuat akun game',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId, senderId } = chatInfo
    const name = args.join(' ').trim()

    if (!name) {
      return conn.sendMessage(chatId, {
        text: `Format salah!\nGunakan: *${prefix}${commandText} <namamu>*\nContoh: *${prefix}${commandText} Farhan*`
      }, { quoted: msg })
    }

    try {
      let gameData = readJSON(p, { FunctionGame: {}, tca: { user: {} }, historyGame: {} })
      const users = gameData.tca.user || {}

      if (Object.values(users).some(u => u.id === senderId)) {
        return conn.sendMessage(chatId, { text: 'Kamu sudah mempunyai akun game.' }, { quoted: msg })
      }
      if (users[name]) {
        return conn.sendMessage(chatId, { text: 'Nama ini sudah digunakan, silakan pilih nama lain.' }, { quoted: msg })
      }

      users[name] = {
        id: senderId,
        lvl: global.lvl,
        maining: '0x hasil',
        inv: global.inv
      }

      gameData.tca.user = users
      writeJSON(p, gameData)

      conn.sendMessage(chatId, {
        text: `Akun berhasil dibuat!\nNama: ${name}\nLevel: ${users[name].lvl}\nketik .game untuk melihat inventory`
      }, { quoted: msg })
    } catch (err) {
      console.error('Error create.js:', err)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membuat akun.' }, { quoted: msg })
    }
  }
}