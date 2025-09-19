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
      console.log('🔗 API URL:', apiUrl);
      
      const res = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // Debug: Log the full API response
      console.log('📦 Full API Response:', JSON.stringify(res.data, null, 2));

      // Check if API returned success
      if (res.data.status !== 200 && res.data.status !== true && res.data.success !== true) {
        throw new Error(`API returned error: ${res.data.message || 'Unknown error'}`);
      }

      // Try different possible response structures
      let mediaArray = null;
      
      if (Array.isArray(res.data.data)) {
        mediaArray = res.data.data;
      } else if (Array.isArray(res.data.result)) {
        mediaArray = res.data.result;
      } else if (Array.isArray(res.data.media)) {
        mediaArray = res.data.media;
      } else if (res.data.data && typeof res.data.data === 'object') {
        // Handle single object response
        mediaArray = [res.data.data];
      } else if (res.data.result && typeof res.data.result === 'object') {
        mediaArray = [res.data.result];
      }

      console.log('📊 Parsed media array:', mediaArray);

      if (!mediaArray || mediaArray.length === 0) {
        throw new Error('No media found in API response. Response structure: ' + JSON.stringify(res.data));
      }

      const mediaData = mediaArray[0];
      console.log('🎬 Media data:', mediaData);

      // Find the actual media URL - try different possible keys
      let mediaUrl = mediaData.url || mediaData.downloadUrl || mediaData.mediaUrl || mediaData.hd_url || mediaData.sd_url;
      
      if (!mediaUrl) {
        throw new Error('No media URL found in response. Available keys: ' + Object.keys(mediaData).join(', '));
      }

      console.log('🔗 Media URL:', mediaUrl);

      // Determine media type
      const isVideo = mediaData.type === 'video' || 
                     mediaUrl.includes('.mp4') || 
                     (mediaData.mediaType && mediaData.mediaType.toLowerCase() === 'video');

      // Send the media
      if (isVideo) {
        await conn.sendMessage(chatId, {
          video: { url: mediaUrl },
          mimetype: 'video/mp4',
          caption: mediaData.caption || mediaData.title || 'Instagram Video',
          fileName: `instagram_${Date.now()}.mp4`
        }, { quoted: msg });
      } else {
        await conn.sendMessage(chatId, {
          image: { url: mediaUrl },
          caption: mediaData.caption || mediaData.title || 'Instagram Photo'
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('❌ Instagram Download Error:', error);
      
      let errorMessage = '❌ Failed to download media. ';
      
      if (error.response) {
        // API returned error status
        errorMessage += `API Error: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Please try again.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      // Truncate very long error messages
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...';
      }
      
      conn.sendMessage(msg.key.remoteJid, { 
        text: errorMessage 
      }, { quoted: msg });
    }
  }
};
