import axios from "axios";

async function getRandomDoujin() {
  
  try {
    const res = await axios.get("https://nhentai.net/random/", {
      maxRedirects: 0,
      validateStatus: s => s === 302,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://nhentai.net/",
      },
    });
    const randomUrl = res.headers.location;
    if (randomUrl && /^\/g\/\d+/.test(randomUrl)) {
      const doujinId = randomUrl.match(/\/g\/(\d+)/)?.[1];
     
      try {
        const html = (
          await axios.get(`https://nhentai.net${randomUrl}`, {
            headers: { "User-Agent": res.config.headers["User-Agent"] },
          })
        ).data;
        const coverMatch = html.match(
          /<img[^>]+class="cover"[^>]+src="([^"]+)"/
        );
        const coverUrl = coverMatch ? coverMatch[1] : `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`;
        return {
          id: doujinId,
          coverUrl,
          mirrors: getAllMirrors(doujinId),
        };
      } catch {
        return {
          id: doujinId,
          coverUrl: `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`,
          mirrors: getAllMirrors(doujinId),
        };
      }
    }
  } catch {

    
  }

  
  try {
    const res = await axios.get("https://nhentai.to/random/", {
      maxRedirects: 0,
      validateStatus: s => s === 302,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://nhentai.to/",
      },
    });
    const randomUrl = res.headers.location;
    if (randomUrl && /^\/g\/\d+/.test(randomUrl)) {
      const doujinId = randomUrl.match(/\/g\/(\d+)/)?.[1];
      
      try {
        const html = (
          await axios.get(`https://nhentai.to${randomUrl}`, {
            headers: { "User-Agent": res.config.headers["User-Agent"] },
          })
        ).data;
        const coverMatch = html.match(
          /<img[^>]+class="cover"[^>]+src="([^"]+)"/
        );
        const coverUrl = coverMatch ? coverMatch[1] : `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`;
        return {
          id: doujinId,
          coverUrl,
          mirrors: getAllMirrors(doujinId),
        };
      } catch {
        return {
          id: doujinId,
          coverUrl: `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`,
          mirrors: getAllMirrors(doujinId),
        };
      }
    }
  } catch {

    
  }

  
  try {
    const api = await axios.get("https://api.nhentai.xxx/galleries/random");
    const gallery = api.data;
    if (gallery && gallery.id) {
      const coverType = gallery.images.cover.t === "j" ? "jpg" : "png";
      const coverUrl = `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${coverType}`;
      return {
        id: gallery.id,
        coverUrl,
        mirrors: getAllMirrors(gallery.id),
      };
    }
  } catch {

    
  }

  
  try {
  
    const html = (await axios.get("https://nhreader.com/random")).data;
    const match = html.match(/href="\/doujin\/(\d+)"/);
    const doujinId = match ? match[1] : null;
    if (doujinId) {
      
      return {
        id: doujinId,
        coverUrl: `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`,
        mirrors: getAllMirrors(doujinId),
      };
    }
  } catch {

    
  }

  
  throw new Error("❌ Tidak bisa mengambil random doujin dari semua mirror/API.");
}


function getAllMirrors(doujinId) {
  return {
    "nhentai.net": `https://nhentai.net/g/${doujinId}/`,
    "nhentai.to": `https://nhentai.to/g/${doujinId}/`,
    "nhentai.xxx": `https://nhentai.xxx/g/${doujinId}/`,
    "nhreader.com": `https://nhreader.com/doujin/${doujinId}`,
    "ZIP (nhentai.xxx)": `https://dl.nhentai.xxx/g/${doujinId}.zip`,
    "ZIP (hiyobi)": `https://cdn.hiyobi.me/doujin/${doujinId}.zip`,
    "API (nhentai.xxx)": `https://api.nhentai.xxx/gallery/${doujinId}`,
    "Cover (nhentai.net CDN)": `https://t.nhentai.net/galleries/${doujinId}/cover.jpg`,
  };
}

export default {
  name: "nhentai-mirrors",
  command: ["nhall", "nhmirrors"],
  tags: "nsfw",
  desc: "Get a random doujin from all available nhentai mirrors and APIs.",
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    try {
      const { id, coverUrl, mirrors } = await getRandomDoujin();
      let text = `🎲 Random nhentai:\nID: ${id}\n\n`;
      text += Object.entries(mirrors)
        .map(([src, url]) => `🔗 *${src}*: ${url}`)
        .join("\n");

      await conn.sendMessage(
        chatId,
        {
          image: { url: coverUrl },
          caption: text,
          footer: "All available mirrors & download links.",
          buttons: [
            {
              buttonId: `.nhdl ${id}`,
              buttonText: { displayText: "⬇️ Download ZIP" },
              type: 1,
            },
          ],
        },
        { quoted: msg }
      );
    } catch (err) {
      await conn.sendMessage(
        chatId,
        {
          text: `❌ Gagal mendapatkan doujin dari semua mirror/API.\n${err.message || err}`,
          quoted: msg,
        }
      );
    }
  },
};
