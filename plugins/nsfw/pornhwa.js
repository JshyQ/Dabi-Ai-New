import axios from "axios";
import cheerio from "cheerio";

export default {
  name: "randomhwa",
  command: ["randomhwa"],
  tags: "nsfw",
  desc: "Get a random trending Pornhwa comic with a cover and PDF link.",
  prefix: true,
  owner: false,
  premium: false,

async function getRandomTrendingPornhwa() {
  
  const { data } = await axios.get("https://pornhwa.me/trending/");
  const $ = cheerio.load(data);


  const comics = [];
  $(".bsx").each((i, el) => {
    const title = $(el).find(".tt").text().trim();
    const cover = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
    const detail = $(el).find("a").attr("href");
    if (title && cover && detail) {
      comics.push({ title, cover, detail });
    }
  });

  if (!comics.length) throw new Error("No comics found.");

  
  const comic = comics[Math.floor(Math.random() * comics.length)];

  const { data: detailHtml } = await axios.get(comic.detail);
  const $$ = cheerio.load(detailHtml);

  
  let pdf = "";
  $$(".eplister a, .wp-manga-chapter a, .btn, .download, .dls a").each((i, elem) => {
    const text = $$(elem).text().toLowerCase();
    if (text.includes("pdf") || text.includes("download")) {
      pdf = $$(elem).attr("href");
      return false;
    }
  });

  
  return {
    title: comic.title,
    cover: comic.cover,
    pdf: pdf || comic.detail,
    detail: comic.detail,
  };
}


  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;

    
    await conn.sendMessage(chatId, {
      react: { text: "⌛", key: msg.key }
    });

    try {
      const comic = await getRandomTrendingPornhwa();
      await conn.sendMessage(chatId, {
        image: { url: comic.cover },
        caption:
          `*${comic.title}*\n\n[Read Online](${comic.detail})\n\n[📥 Download PDF](${comic.pdf})`,
      }, { quoted: msg });
      
      await conn.sendMessage(chatId, {
        react: { text: "✔️", key: msg.key }
      });
    } catch (e) {
      
      await conn.sendMessage(chatId, {
        react: { text: "❌", key: msg.key }
      });
      await conn.sendMessage(chatId, { text: "❌ Gagal mengambil komik trending." }, { quoted: msg });
    }
  }
};
