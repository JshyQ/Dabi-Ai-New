import axios from 'axios';

export default {
  name: 'muslimai',
  command: ['muslimai', 'muslim-ai'],
  tags: 'Ai Menu',
  desc: 'Ask a question to Muslim AI',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const query = args.join(" ").trim();

    if (!query) {
      return conn.sendMessage(chatId, {
        text: '❌ Masukkan pertanyaan untuk Muslim AI.\nContoh: .muslimai Siapa itu Nabi Muhammad?',
        quoted: msg
      });
    }

    
    await conn.sendMessage(chatId, { react: { text: "🕋", key: msg.key } });

    try {
      const apiUrl = `https://izumiiiiiiii.dpdns.org/ai/muslim-ai?text=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      
      let replyText = typeof data === "string" ? data : data.result || data.answer || "❌ Tidak ada jawaban dari API.";

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
  }
};
