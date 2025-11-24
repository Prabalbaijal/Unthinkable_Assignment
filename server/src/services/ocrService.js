const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { recognize } = require("tesseract.js");
const poppler = require("pdf-poppler");

async function pdfToImages(filePath) {
  const outputDir = path.join(__dirname, "../../tmp_pdf_images");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const opts = {
    format: "jpeg",
    out_dir: outputDir,
    out_prefix: path.basename(filePath, path.extname(filePath)),
    page: null,
  };

  await poppler.convert(filePath, opts);

  const images = fs
    .readdirSync(outputDir)
    .filter(f => f.startsWith(opts.out_prefix) && f.endsWith(".jpg"))
    .map(f => path.join(outputDir, f));

  return images;
}

async function ocrImage(imagePath) {
  const result = await recognize(imagePath, "eng");
  return result.data.text.trim();
}

async function doOCR(filePath, mime) {
  console.log("doOCR called:", filePath);

  try {
    // ======= PDF =======
    if (mime === "application/pdf" || filePath.endsWith(".pdf")) {
      console.log("➡ Trying to extract selectable text...");

      const data = fs.readFileSync(filePath);
      const parsed = await pdfParse(data);

      if (parsed.text && parsed.text.trim().length > 5) {
        console.log(" Selectable text found!");
        return parsed.text.trim();
      }

      console.log("No selectable text → converting to images…");

      const images = await pdfToImages(filePath);
      console.log("Generated images:", images);

      let finalText = "";

      for (const img of images) {
        console.log("OCR on:", img);
        const txt = await ocrImage(img);
        finalText += txt + "\n";
      }

      return finalText.trim();
    }

    // ======= IMAGE =======
    console.log("➡ OCR on normal image...");
    const result = await recognize(filePath, "eng");
    return result.data.text.trim();

  } catch (err) {
    console.error("OCR ERROR:", err);
    throw err;
  }
}

module.exports = { doOCR };
