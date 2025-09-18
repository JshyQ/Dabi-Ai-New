import kick from '../plugins/group/kick.js';
import promote from '../plugins/group/promote.js';
import demote from '../plugins/group/demote.js';
import play from '../plugins/download/play.js';
import elevenlabs from '../plugins/fun/elevenlabs.js';

const { run: kickRun } = kick;
const { run: promoteRun } = promote;
const { run: demoteRun } = demote;
const { run: playRun } = play;
const { run: elevenlabsRun } = elevenlabs;

async function rctKey(msg, conn) {
  try {
    const reaction = msg.message.reactionMessage?.text;
    const reactedKey = msg.message.reactionMessage?.key;
    if (!reaction || !reactedKey?.id || !reactedKey?.remoteJid) return;

    const chatId = reactedKey.remoteJid;
    const participant = reactedKey.participant;
    const isFromMe = reactedKey.fromMe;
    const senderId = msg.key.participant || msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return;

    const { botNumber, botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);
    const isTargetFromBot = participant === botNumber;

    const dummyMessage = {
      key: reactedKey,
      message: {
        extendedTextMessage: {
          text: '',
          contextInfo: {
            participant,
            quotedMessage: null,
            mentionedJid: [participant]
          }
        }
      }
    };

    const chatInfo = { chatId, senderId, isGroup };
    const Msg = conn.reactionCache?.get(reactedKey.id);
    const getTextFromMsg = m =>
      m?.message?.conversation ||
      m?.message?.extendedTextMessage?.text ||
      m?.message?.imageMessage?.caption ||
      m?.message?.videoMessage?.caption;

    const handleReaction = async (condition, callback) => {
      if (condition) await callback();
    };

    switch (reaction) {
      case '❌':
        await handleReaction(
          isFromMe || isTargetFromBot || userAdmin,
          async () => {
            if (!isTargetFromBot && !botAdmin) return;
            await conn.sendMessage(chatId, {
              delete: {
                remoteJid: chatId,
                fromMe: isTargetFromBot,
                id: reactedKey.id,
                ...(isTargetFromBot ? {} : { participant })
              }
            });
          }
        );
        break;

      case '🦵':
        await handleReaction(userAdmin && botAdmin, async () =>
          kickRun(conn, dummyMessage, { chatInfo, textMessage: '', prefix: '.', commandText: 'kick', args: [] })
        );
        break;

      case '👑':
        await handleReaction(userAdmin && botAdmin, async () =>
          promoteRun(conn, dummyMessage, { chatInfo, textMessage: '', prefix: '.', commandText: 'promote', args: [] })
        );
        break;

      case '💨':
        await handleReaction(userAdmin && botAdmin, async () =>
          demoteRun(conn, dummyMessage, { chatInfo, textMessage: '', prefix: '.', commandText: 'demote', args: [] })
        );
        break;

      case '🔍':
      case '🔎':
        if (!Msg) return;
        const searchText = getTextFromMsg(Msg);
        if (!searchText) return;
        await playRun(conn, Msg, {
          chatInfo,
          textMessage: searchText,
          prefix: '.',
          commandText: 'play',
          args: searchText.trim().split(/\s+/)
        });
        break;

      case '🌐':
      case '🌏':
      case '🌍':
      case '🌎':
        if (!Msg) return;
        const quotedText = getTextFromMsg(Msg);
        if (!quotedText) return;
        const translated = await translateText(quotedText, 'id');
        if (translated) {
          await conn.sendMessage(chatId, { text: `*Translate:* ${translated}` }, { quoted: Msg });
        }
        break;

      case '🎶':
      case '🎤':
        if (!Msg) return;
        const songText = getTextFromMsg(Msg);
        if (!songText) return;
        await elevenlabsRun(conn, Msg, {
          chatInfo,
          textMessage: `dabi ${songText}`,
          prefix: '.',
          commandText: 'elevenlabs',
          args: ['dabi', ...songText.trim().split(/\s+/)]
        });
        break;

      case '🤮':
      case '🩲':
        if (!Msg) return;
        const reactText = getTextFromMsg(Msg);
        if (!reactText) return;

        const emojis = ['🎤', '📢', '🏳️‍🌈', '🏳️‍⚧️', '🇮🇱', '💀', '✅', '👅', '🙈', '🐽', '🐷', '🐤'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await conn.sendMessage(chatId, {
          react: { text: randomEmoji, key: reactedKey }
        });
        break;
    }
  } catch (err) {
    console.error('Reaction handler error:', err);
  }
}

export default rctKey;