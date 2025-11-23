const { ocrQueue } = require('../queues/ocrQueue');
const { doOCR } = require('../services/ocrService');
const { saveResult } = require('../services/storage');
const { generate } = require('../services/suggestService');
const fs = require('fs');

function startWorkers() {
  console.log(`Starting OCR worker...`);

  ocrQueue.process(1, async (job) => {
    const jobId = job.id;
    const { filePath, mime } = job.data;

    console.log('Worker processing job:', jobId, filePath);
    let result = { text: "", suggestions: [], suggestionsStatus: "pending" };

    try {
      // OCR
      const text = await doOCR(filePath, mime);
      result.text = text;
      await saveResult(jobId, result);
      try { await job.progress(70); } catch {}

      // Suggestions
      const suggestions = await generate(text);
      result.suggestions = suggestions;
      result.suggestionsStatus = "done";
      await saveResult(jobId, result);
      try { await job.progress(100); } catch {}

      // Delayed Cleanup
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("Deleted uploaded file:", filePath);
        }
      }, 5000);

      console.log(`Job ${jobId} done`);
      return result;

    } catch (err) {
      console.error(`Worker error for job ${jobId}:`, err);
      throw err;
    }
  });
}


module.exports = { startWorkers };
