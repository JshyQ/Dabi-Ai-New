import axios from 'axios';

export default {
  name: 'instagram',
  command: ['instagram', 'ig', 'igdl', 'instegrem', 'insta'],
  tags: 'download',
  desc: 'Download media from Instagram',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo, args, prefix, commandText }) => {
    try {
      const { chatId, senderId } = chatInfo;
      
     
      if (!args || !args[0]) {
        return conn.sendMessage(chatId, {
          text: `Please provide Instagram URL!\nExample: *${prefix}${commandText} https://www.instagram.com/p/C1Ck8sENM94/*`
        }, { quoted: msg });
      }

      const url = args[0];
      
    
      if (!url.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[a-zA-Z0-9_-]+\/?/i)) {
        return conn.sendMessage(chatId, { 
          text: 'Invalid URL! Please provide a valid Instagram post, reel, or story link.' 
        }, { quoted: msg });
      }

     
      await conn.sendMessage(chatId, { 
        text: '⏳ Processing your request...' 
      }, { quoted: msg });


      const apiUrl = `https://api.nekolabs.my.id/downloader/instagram?url=${encodeURIComponent(url)}`;
      console.log('🔗 API URL:', apiUrl);
      
      const res = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      
      if (!res.data.status) {
        throw new Error(`API returned error: ${res.data.message || 'Unknown error'}`);
      }

     
      const result = res.data.result;
      if (!result || !result.downloadUrl || result.downloadUrl.length === 0) {
        throw new Error('No download URL found in API response');
      }

      const metadata = result.metadata || {};
      const downloadUrl = result.downloadUrl[0]; 
      const isVideo = metadata.isVideo === true;

      console.log('📊 Media Info:', {
        isVideo: isVideo,
        downloadUrl: downloadUrl,
        caption: metadata.caption
      });

     
      if (!downloadUrl.startsWith('http')) {
        throw new Error('Invalid download URL received from API');
      }

     
      if (isVideo) {
        await conn.sendMessage(chatId, {
          video: { url: downloadUrl },
          mimetype: 'video/mp4',
          caption: metadata.caption || 'Instagram Video',
          fileName: `instagram_${Date.now()}.mp4`
        }, { quoted: msg });
      } else {
        await conn.sendMessage(chatId, {
          image: { url: downloadUrl },
          caption: metadata.caption || 'Instagram Photo'
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('❌ Instagram Download Error:', error);
      
      let errorMessage = '❌ Failed to download media. ';
      
      if (error.response) {
       
        errorMessage += `API Error: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Please try again.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
     
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...';
      }
      
      conn.sendMessage(msg.key.remoteJid, { 
        text: errorMessage 
      }, { quoted: msg });
    }
  }
};
