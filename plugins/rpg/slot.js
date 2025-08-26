const fs = require('fs');
const path = require('path');

const dbPath = '../../toolkit/db';
const gameDBPath = path.join(__dirname, dbPath, 'slot.json');

const delay = ms => new Promise(res => setTimeout(res, ms));
const symbols = ['🕊️', '🦀', '🦎', '🍀', '💎', '🍒'];
const randSym = () => symbols[Math.floor(Math.random() * symbols.length)];

const saveGameLog = data => {
  const gameDB = fs.existsSync(gameDBPath) ? JSON.parse(fs.readFileSync(gameDBPath)) : {};
  gameDB[data.name.toLowerCase()] = data;
  fs.writeFileSync(gameDBPath, JSON.stringify(gameDB, null, 2));
};

module.exports = {
  name: 'Game Slot',
  command: ['isi', 'slot'],
  tags: 'Rpg Menu',
  desc: 'Main slot gacha uang',
  prefix: true,

  run: async (conn, msg, { chatInfo, args, commandText }) => {
    const { chatId, senderId, pushName } = chatInfo;
    const db = getDB();
    const user = Object.values(db.Private).find(u => u.Nomor === senderId);

    if (!user)
      return conn.sendMessage(chatId, { text: 'Kamu belum daftar!, gunakan *.daftar*' }, { quoted: msg });

    const bet = parseInt(args[0]);
    if (!args[0] || isNaN(bet) || bet <= 0)
      return conn.sendMessage(chatId, { text: `Masukkan jumlah yang valid!\nContoh: .${commandText} 10000` }, { quoted: msg });

    const saldo = user.money?.amount || 0;
    if (bet > saldo)
      return conn.sendMessage(chatId, { text: 'Saldo kamu tidak cukup!' }, { quoted: msg });

    const row1 = [randSym(), randSym(), randSym()];
    const row3 = [randSym(), randSym(), randSym()];
    const menang = Math.random() < 0.5;

    const row2 = menang ? Array(3).fill(randSym()) : (() => {
      let r;
      do { r = [randSym(), randSym(), randSym()] }
      while (r[0] === r[1] && r[1] === r[2]);
      return r;
    })();

    const hasil = row2.join(' : ');
    let hasilUang = menang ? bet * 2 : -bet;

    const bank = global.loadBank();
    const bankSaldo = bank.bank?.saldo || 0;

    if (!menang) {
      user.money.amount += hasilUang;
      bank.bank.saldo += Math.abs(hasilUang);
    } else {
      if (bankSaldo >= hasilUang) {
        user.money.amount += hasilUang;
        bank.bank.saldo -= hasilUang;
      } else {
        hasilUang = bankSaldo;
        user.money.amount += hasilUang;
        bank.bank.saldo = 0;
      }
    }

    global.saveBank(bank);
    saveDB();
    saveGameLog({
      name: pushName,
      user: senderId,
      bet,
      gain: hasilUang,
      result: hasil,
      win: menang,
      time: new Date().toISOString()
    });

    const teks = `
╭───🎰 GACHA UANG 🎰───╮
│               ${row1.join(' : ')}
│               ${hasil}
│               ${row3.join(' : ')}
╰────────────────────╯
             ${menang ? `🎉 Kamu Menang! +${hasilUang.toLocaleString()}` : `💥 Zonk! -${Math.abs(hasilUang).toLocaleString()}`}
`.trim();

    const pesanAwal = await conn.sendMessage(chatId, { text: '🎲 Gacha dimulai...' }, { quoted: msg });
    await delay(2000);
    return conn.sendMessage(chatId, { text: teks, edit: pesanAwal.key });
  }
};