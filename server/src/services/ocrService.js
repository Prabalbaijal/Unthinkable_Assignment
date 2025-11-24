const fs = require("fs");
const pdfParse = require("pdf-parse");
const { recognize } = require("tesseract.js");

async function doOCR(filePath, mime) {
  console.log("doOCR called:", filePath);

  try {
    // ===================== PDF =====================
    if (mime === "application/pdf" || filePath.endsWith(".pdf")) {
      console.log("➡ Extracting PDF text only (NO image conversion)...");

      const data = fs.readFileSync(filePath);
      const parsed = await pdfParse(data);

      // Parsed text from PDF
      const text = parsed.text?.trim();

      if (!text || text.length < 5) {
        console.log(" PDF has NO selectable text.");
        return "PDF contains no selectable text. ";
      }

      console.log(" PDF text extracted successfully!");
      return text;
    }

    // ===================== IMAGE =====================
    console.log(" OCR on IMAGE using Tesseract...");
    const result = await recognize(filePath, "eng+hin");
    return result.data.text.trim();

  } catch (err) {
    console.error("OCR ERROR:", err);
    throw err;
  }
}

module.exports = { doOCR };
