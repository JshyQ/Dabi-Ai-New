/*
  base   : https://ssvid.net/
  update : 28 agustus 2025
  note   : bisa langsung masukin url youtube
           atau query di dalam fungsi .download
           format tersedia : mp3, 360p, 720p, 1080p
  node   : v24.5.0
  by     : wolep
*/
 
const yt = {
    get baseUrl() {
        return {
            origin: 'https://ssvid.net'
        }
    },
 
    get baseHeaders() {
        return {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': this.baseUrl.origin,
            'referer': this.baseUrl.origin + '/youtube-to-mp3'
        }
    },
 
    validateFormat: function (userFormat) {
        const validFormat = ['mp3', '360p', '720p', '1080p']
        if (!validFormat.includes(userFormat)) throw Error(`invalid format!. available formats: ${validFormat.join(', ')}`)
    },
 
    handleFormat: function (userFormat, searchJson) {
        this.validateFormat(userFormat)
        let result
        if (userFormat == 'mp3') {
            result = searchJson.links?.mp3?.mp3128?.k
        } else {
            let selectedFormat
            const allFormats = Object.entries(searchJson.links.mp4)
 
            const quality = allFormats.map(v => v[1].q).filter(v => /\d+p/.test(v)).map(v => parseInt(v)).sort((a, b) => b - a).map(v => v + 'p')
            if (!quality.includes(userFormat)) {
                selectedFormat = quality[0]
                console.log(`format ${userFormat} gak ada. auto fallback ke best available yaitu ${selectedFormat}`)
            } else {
                selectedFormat = userFormat
            }
            const find = allFormats.find(v => v[1].q == selectedFormat)
            result = find?.[1]?.k
        }
        if (!result) throw Error(`${userFormat} gak ada cuy. aneh`)
        return result
    },
 
    hit: async function (path, payload) {
        try {
            const body = new URLSearchParams(payload)
            const opts = { headers: this.baseHeaders, body, 'method': 'post' }
            const r = await fetch(`${this.baseUrl.origin}${path}`, opts)
            console.log('hit', path)
            if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
            const j = await r.json()
            return j
        } catch (e) {
            throw Error(`${path}\n${e.message}`)
        }
    },
 
    download: async function (queryOrYtUrl, userFormat = 'mp3') {
        this.validateFormat(userFormat)
 
        // first hit
        let search
        search = await this.hit('/api/ajax/search', {
            "query": queryOrYtUrl,
            "cf_token": "",
            "vt": "youtube"
        })
 
        if (search.p == 'search') {
            if (!search?.items?.length) throw Error(`hasil pencarian ${queryOrYtUrl} tidak ada`)
            const { v, t } = search.items[0]
            const videoUrl = 'https://www.youtube.com/watch?v=' + v
            console.log(`[found]\ntitle : ${t}\nurl   : ${videoUrl}`)
 
            // first hit again...
            search = await this.hit('/api/ajax/search', {
                "query": videoUrl,
                "cf_token": "",
                "vt": "youtube"
            })
 
        }
 
        const vid = search.vid
        const k = this.handleFormat(userFormat, search)
 
        // second hit
        const convert = await this.hit('/api/ajax/convert', {
            k, vid
        })
 
        if (convert.c_status == 'CONVERTING') {
            let convert2
            const limit = 5
            let attempt = 0
            do {
                attempt++
                // third hit
                console.log (`cek convert ${attempt}/${limit}`)
                convert2 = await this.hit('/api/convert/check?hl=en', {
                    vid,
                    b_id: convert.b_id
                })
                if (convert2.c_status == 'CONVERTED') {
                    return convert2
                }
                await new Promise(re => setTimeout(re, 5000))
            } while (attempt < limit && convert2.c_status == 'CONVERTING')
            throw Error('file belum siap / status belum di ketahui')
 
        } else {
            return convert
        }
    },
 
}
 
// cara pakai
yt.download("sum 41 pieces", "mp3")
    .then(console.log)
    .catch(e => {
        console.log(e.message)
    })
 
/* output
{
  status: 'ok',
  mess: '',
  c_status: 'CONVERTED',
  vid: 'By7ctqcWxyM',
  title: 'Sum 41 - Pieces',
  ftype: 'mp3',
  fquality: '128',
  dlink: 'https://dl192.dmate9.online/?file=M3R4SUNiN................DlDZ2RZUEhTcFE9PQ%3D%3D' 
}
 
 
atau.....
 
yt.download("https://www.youtube.com/watch?v=3RwODFwgmxQ", "360p") // mp3, 360p, 720p, 1080p, (empty param auto download mp3)
 
*/
