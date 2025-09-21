import axios from "axios";
import cheerio from "cheerio";


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


export async function run(conn, msg, args, extra) {
  
  await conn.sendMessage(msg.chat, {
    react: { text: "⌛", key: msg.key }
  });

  try {
    const comic = await getRandomTrendingPornhwa();
    await conn.sendMessage(msg.chat, {
      image: { url: comic.cover },
      caption:
        `*${comic.title}*\n\n[Read Online](${comic.detail})\n\n[📥 Download PDF](${comic.pdf})`,
    }, { quoted: msg });
    
    await conn.sendMessage(msg.chat, {
      react: { text: "✔️", key: msg.key }
    });
  } catch (e) {
    
    await conn.sendMessage(msg.chat, {
      react: { text: "❌", key: msg.key }
    });
    await conn.sendMessage(msg.chat, { text: "❌ Gagal mengambil komik trending." }, { quoted: msg });
  }
}
