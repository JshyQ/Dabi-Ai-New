import axios from 'axios';


function isFromBot(msg, conn) {
  if (!msg.quoted) return false;
  
  const quotedSender = msg.quoted.sender || msg.quoted.from || "";
  const botId = (conn.user?.id || conn.user?.jid || conn.user?.username || "").replace(/[^0-9@]/g, "");
  return quotedSender && botId && quotedSender.includes(botId);
}

export default {
  name: 'muslimai',
  command: ['muslimai', 'muslim-ai'],
  tags: 'Ai Menu',
  desc: 'Ask a question to Muslim AI or just reply to the bot message!',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;

   
    let question = args.join(" ").trim();
    const isReplyToBot = msg.quoted && isFromBot(msg, conn);

    if (!question && isReplyToBot) {
      
      question = msg.body?.trim() || msg.text?.trim();
    }

    if (!question) {
      return conn.sendMessage(chatId, {
        text: '❌ Masukkan pertanyaan untuk Muslim AI.\nContoh: .muslimai Siapa itu Nabi Muhammad?\nAtau balas (reply) pesan bot ini dengan pertanyaan Anda.',
        quoted: msg
      });
    }

    
    await conn.sendMessage(chatId, { react: { text: "🕋", key: msg.key } });

    try {
      const apiUrl = `https://izumiiiiiiii.dpdns.org/ai/muslim-ai?text=${encodeURIComponent(question)}`;
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
  }
};
