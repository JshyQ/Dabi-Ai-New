/**
 * Generator Image - CreArt
 * Author  : gienetic
 * Base    : https://play.google.com/store/apps/details?id=ai.aiart.aiartgenerator.creart
 */
 
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
 
/**
 * NOTE:
 * - CreartAI ini kagak mudeng bahasa Indonesia 😅
 * - Jadi setiap prompt otomatis gue translate dulu ke English
 * - Translatenya pake Google Translate gratisan (endpoint public)
 */
 
/**
 * Translate teks otomatis ke bahasa Inggris
 * @param {string} text - input teks (indo / campur2)
 * @returns {Promise<string>} - hasil translate ke english
 */
async function translateToEnglish(text) {
  try {
    const url = "https://translate.googleapis.com/translate_a/single";
    const params = {
      client: "gtx",
      sl: "auto", // auto detek bahasa
      tl: "en",   // target english
      dt: "t",
      q: text,
    };
 
    const res = await axios.get(url, { params });
    return res.data[0][0][0]; // ambil hasil translate
  } catch (err) {
    console.error("Translate Error:", err.message);
    return text; // fallback: balikin teks asli aja
  }
}
 
/**
 * Text2Image - bikin gambar dari teks
 * @param {string} prompt - teks prompt (indo/eng)
 * @returns {Promise<Buffer>} - buffer gambar hasil generate
 */
async function creartTxt2Img(prompt) {
  try {
    const translatedPrompt = await translateToEnglish(prompt);
 
    const form = new FormData();
    form.append("prompt", translatedPrompt);
    form.append("input_image_type", "text2image");
    form.append("aspect_ratio", "4x5");
    form.append("guidance_scale", "9.5");
    form.append("controlnet_conditioning_scale", "0.5");
 
    const response = await axios.post(
      "https://api.creartai.com/api/v2/text2image",
      form,
      {
        headers: form.getHeaders(),
        responseType: "arraybuffer", // hasilnya langsung gambar (binary)
      }
    );
 
    return Buffer.from(response.data);
  } catch (err) {
    throw new Error("❌ Gagal bikin gambar (txt2img): " + (err?.message || err));
  }
}
 
/**
 * Image2Image - edit/generate gambar dari input image
 * @param {string} prompt - teks prompt (indo/eng)
 * @param {string} imagePath - path file gambar input
 * @returns {Promise<Buffer>} - buffer gambar hasil generate
 */
async function creartImg2Img(prompt, imagePath) {
  try {
    const translatedPrompt = await translateToEnglish(prompt);
 
    const form = new FormData();
    form.append("prompt", translatedPrompt);
    form.append("input_image_type", "image2image");
    form.append("aspect_ratio", "4x5");
    form.append("guidance_scale", "9.5");
    form.append("controlnet_conditioning_scale", "0.5");
    form.append("image_file", fs.createReadStream(imagePath));
 
    const response = await axios.post(
      "https://api.creartai.com/api/v2/image2image",
      form,
      {
        headers: form.getHeaders(),
        responseType: "arraybuffer", // hasilnya langsung gambar (binary)
      }
    );
 
    return Buffer.from(response.data);
  } catch (err) {
    throw new Error("❌ Gagal bikin gambar (img2img): " + (err?.message || err));
  }
}
 
module.exports = { creartTxt2Img, creartImg2Img };
 
