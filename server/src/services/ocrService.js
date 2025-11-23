const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const pdfPoppler = require('pdf-poppler'); // Correct usage

// Convert PDF pages to images
async function pdfToImages(filePath) {
  const outputDir = path.join(__dirname, 'temp_images');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const opts = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: path.basename(filePath, path.extname(filePath)),
    page: null // convert all pages
  };

  await pdfPoppler.convert(filePath, opts); // Use convert directly
  const images = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(outputDir, f));

  return images;
}

// Main OCR function
async function doOCR(filePath, mime) {
  console.log('doOCR called for:', filePath);

  try {
    // Handle PDFs
    if (mime === 'application/pdf' || filePath.endsWith('.pdf')) {
      console.log('Processing PDF...');
      const data = fs.readFileSync(filePath);
      const parsed = await pdf(data);

      if (parsed.text.trim()) {
        console.log('PDF contains selectable text.');
        return parsed.text;
      } else {
        console.log('PDF has no text, converting pages to images for OCR...');
        const images = await pdfToImages(filePath);
        let finalText = '';
        for (let img of images) {
          finalText += await doOCR(img, 'image') + '\n';
        }
        return finalText.trim();
      }
    }

    // Handle image files
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
