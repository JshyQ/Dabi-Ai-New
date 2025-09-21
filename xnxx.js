import { fetch } from 'undici';
import cheerio from 'cheerio';

class Xnxx {
    async search(query) {
        try {
            const page = Math.floor(3 * Math.random()) + 1;
            const resp = await fetch(`https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`);
            const $ = cheerio.load(await resp.text());

            const results = [];
            $('div[id*="video"]').each((_, bkp) => {
                const title = $(bkp).find('.thumb-under p:nth-of-type(1) a').text().trim();
                const views = $(bkp).find('.thumb-under p.metadata span.right').contents().not('span.superfluous').text().trim();
                const resolution = $(bkp).find('.thumb-under p.metadata span.video-hd').contents().not('span.superfluous').text().trim();
                const duration = $(bkp).find('.thumb-under p.metadata').contents().not('span').text().trim();
                const cover = $(bkp).find('.thumb-inside .thumb img').attr('data-src');
                let url = $(bkp).find('.thumb-inside .thumb a').attr('href');
                if (url) url = url.replace("/THUMBNUM/", "/");

                if (url && title) {
                    results.push({
                        title,
                        views,
                        resolution,
                        duration,
                        cover,
                        url: `https://xnxx.com${url}`
                    });
                }
            });

            return results;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async download(url) {
        try {
            const resp = await fetch(url);
            const $ = cheerio.load(await resp.text());

            
            let scriptContent = '';
            $('script').each((_, el) => {
                const html = $(el).html();
                if (html && html.includes('html5player.setVideoUrlLow')) {
                    scriptContent = html;
                }
            });

            const extractData = (regex) => (scriptContent.match(regex) || [])[1] || null;

            const videos = {
                low: extractData(/html5player\.setVideoUrlLow\('(.*?)'\);/),
                high: extractData(/html5player\.setVideoUrlHigh\('(.*?)'\);/),
                HLS: extractData(/html5player\.setVideoHLS\('(.*?)'\);/)
            }

            const thumb = extractData(/html5player\.setThumbUrl\('(.*?)'\);/);

            return {
                videos,
                thumb
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default {
    name: 'xnxx',
    command: ['xnxx'],
    tags: 'Nsfw Menu',
    desc: 'Send a random XNXX video by keyword search.',
    prefix: true,
    owner: false,
    premium: false,

    run: async (conn, msg, { chatInfo, args }) => {
        const { chatId } = chatInfo;
        const input = args.join(" ");
        if (!input) {
            return conn.sendMessage(chatId, {
                text: '❌ Masukkan keyword untuk mencari video!\nContoh: .xnxx japanese',
            }, { quoted: msg });
        }

        await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

        try {
            const xnxx = new Xnxx();
            const results = await xnxx.search(input);
            if (!results || results.length === 0) {
                await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
                return conn.sendMessage(chatId, { text: '❌ Tidak ditemukan video untuk keyword tersebut.', quoted: msg });
            }
            const picked = results[Math.floor(Math.random() * results.length)];

            
            const dl = await xnxx.download(picked.url);
            const videoUrl = dl.videos.high || dl.videos.low || dl.videos.HLS;
            const thumb = dl.thumb || picked.cover;

            let caption = `*${picked.title}*\nDuration: ${picked.duration}\nViews: ${picked.views}\nResolution: ${picked.resolution}\n[🔗 Buka Video](${picked.url})`;
            if (videoUrl) caption += `\n[▶️ Direct Video](${videoUrl})`;

            if (thumb) {
                await conn.sendMessage(chatId, {
                    image: { url: thumb },
                    caption,
                }, { quoted: msg });
            } else {
                await conn.sendMessage(chatId, {
                    text: caption,
                }, { quoted: msg });
            }

            await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

        } catch (err) {
            await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
            await conn.sendMessage(chatId, { text: '❌ Gagal mengambil video dari XNXX.', quoted: msg });
        }
    }
};
