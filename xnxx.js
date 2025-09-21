import { PornHub } from 'pornhub.js';

class Ph {
    constructor() {
        this.client = new PornHub();
    }

    async search(query) {
        try {
            const results = await this.client.searchVideo(query);
            if (!results.data || results.data.length === 0) return [];
            
            return results.data.sort(() => Math.random() - 0.5);
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
}

export default {
    name: 'ph',
    command: ['ph'],
    tags: 'Nsfw Menu',
    desc: 'Search PornHub and send a random video result for the given keyword.',
    prefix: true,
    owner: false,
    premium: false,

    run: async (conn, msg, { chatInfo, args }) => {
        const { chatId } = chatInfo;
        const query = args.join(" ");
        if (!query) {
            return conn.sendMessage(chatId, {
                text: '❌ Masukkan keyword pencarian!\nContoh: .ph japanese',
            }, { quoted: msg });
        }

        await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

        try {
            const ph = new Ph();
            const results = await ph.search(query);
            if (results.length === 0) {
                await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
                return conn.sendMessage(chatId, { text: "❌ Tidak ditemukan video untuk keyword tersebut.", quoted: msg });
            }
            const picked = results[0]; 

            let caption = `*${picked.title}*\nUploader: ${picked.author?.name}\nDuration: ${picked.duration}\nViews: ${picked.views}\nRating: ${picked.rating}\n[🔗 Watch on PornHub](${picked.url})`;

            if (picked.thumb) {
                await conn.sendMessage(chatId, {
                    image: { url: picked.thumb },
                    caption,
                }, { quoted: msg });
            } else {
                await conn.sendMessage(chatId, {
                    text: caption,
                }, { quoted: msg });
            }

            await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
        } catch (error) {
            await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
            await conn.sendMessage(chatId, { text: `❌ Gagal mencari video.\n${error.message}` }, { quoted: msg });
        }
    }
};
