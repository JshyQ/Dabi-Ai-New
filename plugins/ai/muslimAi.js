import axios from 'axios';


const muslimAiState = {};


function isMuslimAiOn(chatId) {
  
  return muslimAiState[chatId] !== false;
}

export default {
  name: 'muslimai',
  command: ['muslimai', 'muslim-ai'],
  tags: 'Ai Menu',
  desc: 'Ask a question to Muslim AI or turn auto reply on/off with ".muslimai on/off"',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const query = args.join(" ").trim().toLowerCase();

    
    if (query === "on" || query === "off") {
      muslimAiState[chatId] = query === "on";
      await conn.sendMessage(chatId, {
        text: `🧕🏻 Fitur MuslimAI auto-reply telah *${query === "on" ? "diaktifkan" : "dinonaktifkan"}* untuk chat ini.`,
        quoted: msg
      });
      return;
    }

    
    if (!query) {
      return conn.sendMessage(chatId, {
        text: '❌ Masukkan pertanyaan untuk Muslim AI.\nContoh: .muslimai Siapa itu Nabi Muhammad?\nAtau balas (reply) pesan bot ini dengan pertanyaan Anda.',
        quoted: msg
      });
    }

    
    await conn.sendMessage(chatId, { react: { text: "🕋", key: msg.key } });

    try {
      const apiUrl = `https://izumiiiiiiii.dpdns.org/ai/muslim-ai?text=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      let replyText = (data && data.message) ? data.message : "❌ Tidak ada jawaban dari Muslim AI.";

      await conn.sendMessage(chatId, { text: replyText, quoted: msg });
      await conn.sendMessage(chatId, { react: { text: "🧕🏻", key: msg.key } });
    } catch (error) {
      console.error('MuslimAI API Error:', error?.response?.data ?? error);
      await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
      await conn.sendMessage(chatId, {
        text: '❌ Gagal mendapatkan jawaban dari Muslim AI.',
        quoted: msg
      });
    }
  },

  isMuslimAiOn,
};
