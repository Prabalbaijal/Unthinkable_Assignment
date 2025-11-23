const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function doOCR(filePath, mime) {
  console.log('doOCR called for:', filePath);

  try {
    if (mime === 'application/pdf' || filePath.endsWith('.pdf')) {
      console.log('Processing PDF...');
      const data = fs.readFileSync(filePath);
      const parsed = await pdf(data);
      console.log('PDF OCR done');
      return parsed.text || '';
    }

    // IMAGE → Cloud OCR API (ocr.space)
    console.log('Processing Image via OCR API...');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('language', 'eng');
    form.append('OCREngine', '2');

    const res = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: { apikey: process.env.OCR_SPACE_KEY, ...form.getHeaders() }
    });

    const text = res.data.ParsedResults?.[0]?.ParsedText || '';
    console.log('Image OCR done');
    return text;

  } catch (err) {
    console.error('doOCR error:', err);
    throw err;
  }
}

module.exports = { doOCR };
