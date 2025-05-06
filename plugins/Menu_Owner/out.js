module.exports = {
  name: 'out',
  command: ['keluar', 'out'],
  tags: 'Owner Menu',
  desc: 'Mengeluarkan bot dari group',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    let targetGroup = chatId;

    if (args.length > 0) {
      const groups = await conn.groupFetchAllParticipating();
      const groupList = Object.values(groups);

      if (!groupList.length) {
        return conn.sendMessage(chatId, { text: '📌 Bot tidak tergabung dalam grup mana pun.' }, { quoted: message });
      }

      const input = args[0];
      let selectedGroup = null;

      if (/^\d+$/.test(input)) {
        const index = parseInt(input, 10) - 1;
        if (index >= 0 && index < groupList.length) {
          selectedGroup = groupList[index].id;
        }
      } else if (input.endsWith('@g.us')) {
        selectedGroup = groupList.find(g => g.id === input)?.id;
      }

      if (!selectedGroup) {
        return conn.sendMessage(chatId, { text: '❌ Grup tidak ditemukan. Gunakan nomor dari perintah *listgc* atau ID grup yang valid.' }, { quoted: message });
      }

      targetGroup = selectedGroup;
    }

    if (!targetGroup.endsWith('@g.us')) {
      return conn.sendMessage(chatId, { text: '❌ ID grup tidak valid!' }, { quoted: message });
    }

    try {
      await conn.sendMessage(targetGroup, { text: '👋 Bot akan keluar dari grup ini...' });
      await conn.groupLeave(targetGroup);
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, { text: '❌ Gagal keluar dari grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};