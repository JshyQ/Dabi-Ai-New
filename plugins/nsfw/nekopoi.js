import axios from 'axios';

class Kucing {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.explorethefrontierforlimitlessimaginationanddiscov.com/330cceade91a6a9cd30fb8042222ed56/71b8acf33b508c7543592acd9d9eb70d',
            headers: {
                token: 'XbGSFkQsJYbFC6pcUMCFL4oNHULvHU7WdDAXYgpmqYlh7p5ZCQ4QZ13GDgowiOGvAejz9X5H6DYvEQBMrc3A17SO3qwLwVkbn6YY',
                accept: 'application/json',
                appbuildcode: '25301',
                appsignature: 'pOplm8IDEDGXN55IaYohQ8CzJFvWsfXyhGvwPRD9kWgzYSRuuvAOPfsE0AJbHVbAJyWGsGCNUIuQLJ7HbMbuFLMWwDgHNwxOrYMH',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.10.0',
                'if-modified-since': 'Fri, 20 Jun 2025 07:10:42 GMT'
            }
        });
    }

    async latest() {
        const { data } = await this.client('/recent')
            .catch(error => {
                throw new Error(error.message);
            });
        return data;
    }

    async indeks(letter, type, page = '1') {
        const _letter = ['0-9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const _type = ['hentai', '2d_animation', '3d_hentai', 'jav', 'jav_cosplay'];
        if (!_letter.includes(letter)) throw new Error(`List available letters: ${_letter.join(', ')}`);
        if (!_type.includes(type)) throw new Error(`List available types: ${_type.join(', ')}`);

        const { data } = await this.client(`/listall?letter=${letter}&type=${type}&page=${page}`)
            .catch(error => {
                throw new Error(error.message);
            });
        return data;
    }

    async genre(genre) {
        const _genre = ['action', 'ahegao', 'anal', 'armpit', 'bdsm', 'big_oppai', 'blackmail', 'blonde', 'blowjob', 'bondage', 'comedy', 'creampie', 'dark_skin', 'dilf', 'elf', 'exhibitionist', 'fellatio', 'female_monster', 'femdom', 'footjob', 'forced', 'furry', 'futanari', 'gangbang', 'gore', 'handjob', 'harem', 'horror', 'housewife', 'humilation', 'humiliation', 'hypnotize', 'incest', 'intercrural', 'jav', 'lactation', 'loli', 'maid', 'male_monster', 'masturbation', 'megane', 'milf', 'mind_control', 'monster', 'netorare', 'nurse', 'old_man', 'onee_san', 'oral', 'paizuri', 'pantyhose', 'pregnant', 'prostitution', 'rape', 'romance', 'saimin', 'schoolgirl', 'semi_hentai', 'sex_toys', 'shibari', 'shota', 'stocking', 'succubus', 'supranatural', 'swimsuit', 'tentacles', 'threesome', 'tsundere', 'ugly_bastard', 'uncensored', 'vanilla', 'virgin', 'yaoi', 'yuri'];
        if (!_genre.includes(genre)) throw new Error(`List available genres: ${_genre.join(', ')}`);

        const { data } = await this.client(`/searchByGenre?term=${_genre.indexOf(genre)}`)
            .catch(error => {
                throw new Error(error.message);
            });
        return data;
    }

    async search(query, page = '1') {
        if (!query) throw new Error('Query is required');
        const { data } = await this.client(`/search?q=${query}&page=${page}`)
            .catch(error => {
                throw new Error(error.message);
            });
        return data;
    }

    async detail(id) {
        if (!id || isNaN(id)) throw new Error('ID is required');
        const { data } = await this.client(`/post?id=${id}`)
            .catch(error => {
                throw new Error(error.message);
            });
        return data;
    }

    async series(id) {
        if (!id || isNaN(id)) throw new Error('ID is required');
        const { data } = await this.client(`/series?id=${id}`)
            .catch(error => {
                throw new Error(error.message);
            });
        return data;
    }
}

export const command = ['kucinglatest'];
export const tags = ['tools'];
export const help = ['kucinglatest - Get latest kucing content'];

export async function run(conn, msg, { chatInfo, args }) {
    const { chatId } = chatInfo;
    const k = new Kucing();
    await conn.sendMessage(chatId, { react: { text: "⌛", key: msg.key } });
    try {
        const resp = await k.latest();
        
        if (Array.isArray(resp) && resp.length > 0) {
            await conn.sendMessage(chatId, {
                text: JSON.stringify(resp[0], null, 2)
            }, { quoted: msg });
        } else {
            await conn.sendMessage(chatId, {
                text: JSON.stringify(resp, null, 2)
            }, { quoted: msg });
        }
        await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
    } catch (e) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
        await conn.sendMessage(chatId, { text: "❌ Gagal mengambil data kucing." }, { quoted: msg });
    }
}
