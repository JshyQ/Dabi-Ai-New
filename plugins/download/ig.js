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
      
      // Check if URL is provided
      if (!args || !args[0]) {
        return conn.sendMessage(chatId, {
          text: `Please provide Instagram URL!\nExample: *${prefix}${commandText} https://www.instagram.com/p/C1Ck8sENM94/*`
        }, { quoted: msg });
      }

      const url = args[0];
      
      // Validate Instagram URL
      if (!url.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[a-zA-Z0-9_-]+\/?/i)) {
        return conn.sendMessage(chatId, { 
          text: 'Invalid URL! Please provide a valid Instagram post, reel, or story link.' 
        }, { quoted: msg });
      }

      // Send processing message
      await conn.sendMessage(chatId, { 
        text: '⏳ Processing your request...' 
      }, { quoted: msg });

      // Call the API
      const apiUrl = `https://api.nekolabs.my.id/downloader/instagram?url=${encodeURIComponent(url)}`;
      console.log('API URL:', apiUrl); // Debug log
      
      const res = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // Debug: Log the full API response
      console.log('API Response:', JSON.stringify(res.data, null, 2));

      // Check if API returned valid data
      if (!res.data || !res.data.data || res.data.data.length === 0) {
        throw new Error('No media found in API response');
      }

      const mediaData = res.data.data[0]; // Get first media item
      
      // Determine media type and send appropriate message
      if (mediaData.type === 'video' || mediaData.url.includes('.mp4')) {
        // It's a video
        await conn.sendMessage(chatId, {
          video: { url: mediaData.url },
          mimetype: 'video/mp4',
          caption: mediaData.caption || 'Instagram Video',
          fileName: `instagram_${Date.now()}.mp4`
        }, { quoted: msg });
      } else {
        // It's an image
        await conn.sendMessage(chatId, {
          image: { url: mediaData.url },
          caption: mediaData.caption || 'Instagram Photo'
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('Instagram Download Error:', error);
      
      let errorMessage = '❌ Failed to download media. ';
      
      if (error.response) {
        // API returned error status
        errorMessage += `API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Please try again.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      conn.sendMessage(msg.key.remoteJid, { 
        text: errorMessage 
      }, { quoted: msg });
    }
  }
};
