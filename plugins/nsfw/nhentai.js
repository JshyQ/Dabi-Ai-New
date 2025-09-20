export default {
  name: 'nhentai',
  command: ['nhentai'],
  tags: 'Nsfw Menu',
  desc: 'Scrape nHentai data',
  prefix: true,
  owner: true,
  premium: true,
  nHentai
}

const { fetch } = require('undici');
const cheerio = require('cheerio');

class nHentai {
    hpage = async function (page) {
        try {
            if (!page) {
                throw new Error('Page diperlukan!');
            }
            let hentaiData = {};
            const response = await fetch(`https://nhentai.net/home?page=${page}`);
            const $ = cheerio.load(await response.text());
            
            $('.container').each((_, list) => {
                const type = $(list).find('h2').text().trim()
                hentaiData[type] = [];
                
                $(list).find('.gallery').each((_, element) => {
                    const cover = $(element).find('img').attr('src') || $(element).find('img').attr('data-src')
                    const title = $(element).find('.caption').text().trim()
                    const url = $(element).find('a.cover').attr('href')
                    
                    hentaiData[type].push({
                        title,
                        cover,
                        url: 'https://nhentai.net' + url
                    })
                })
            })
            return hentaiData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    search = async function (query, page) {
        try {
            if (!page || !query) {
                throw new Error('Query & Page diperlukan!');
            }
            let hentaiData = [];
            const response = await fetch(`https://nhentai.net/search/?q=${query}&page=${page}`)
            const $ = cheerio.load(await response.text())
            
            const galleryElements = $('.gallery');
            for (const element of galleryElements) {
                const title = $(element).find('.caption').text().trim();
                const url = $(element).find('a.cover').attr('href');
                const cover = await this.getThumb('https://nhentai.net' + url);
                hentaiData.push({ 
                    title, 
                    cover, 
                    url: 'https://nhentai.net' + url 
                });
            }
            return hentaiData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    detail = async function (url) {
        try {
            if (!url) {
                throw new Error('Url diperlukan!');
            }
            const response = await fetch(url)
            const $ = cheerio.load(await response.text())
            
            const hmm = $('#cover a').attr('href');
            const resp = await fetch(`https://nhentai.net${hmm}`);
            const $$ = cheerio.load(await resp.text());
            
            const cover = await this.getThumb(url);
            
            const hentaiData = {
                title: {
                    main: $('#info h1').text().trim(),
                    japanese: $('#info h2').text().trim()
                },
                id: $('#info h3').contents().not('span').text().trim(),
                parody: $('#info a[href*="/parody/"] span.name').map((_, tag) => $(tag).text().trim()).get().join(', '),
                tags: $('#info a[href*="/tag/"] span.name').map((_, tag) => $(tag).text().trim()).get().join(', '),
                artists: $('#info a[href*="/artist/"] span.name').map((_, tag) => $(tag).text().trim()).get().join(', '),
                languages: $('#info a[href*="/language/"] span.name').map((_, tag) => $(tag).text().trim()).get().join(', '),
                categories: $('#info a[href*="/category/"] span.name').map((_, tag) => $(tag).text().trim()).get().join(', '),
                pages: $('#info a[href*="pages"] span.name').text().trim(),
                cover,
                uploadDate: $('#info time').text().trim(),
                url: url
            }
            
            return hentaiData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    getImage = async function (url) {
        try {
            if (!url) {
                throw new Error('Url diperlukan!');
            }
            
            const images = [];
            const response = await fetch(url);
            const $ = cheerio.load(await response.text());
            
            const elements = $('.thumb-container').toArray();
            for (const el of elements) {
                const hmm = $(el).find('a.gallerythumb').attr('href');
                if (hmm) {
                    const resp = await fetch(`https://nhentai.net${hmm}`);
                    const $$ = cheerio.load(await resp.text());
                    const image = $$('[id="image-container"] img').attr('src');
                    if (image) {
                        images.push(image);
                    }
                }
            }
            
            return images;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    getThumb = async function (url) {
        try {
            if (!url) {
                throw new Error('Url diperlukan!');
            }
            const response = await fetch(url)
            const $ = cheerio.load(await response.text())
            
            const hmm = $('#cover a').attr('href');
            const resp = await fetch(`https://nhentai.net${hmm}`);
            const $$ = cheerio.load(await resp.text());
            
            return $$('#image-container img').attr('src');
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
