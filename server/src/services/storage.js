const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '../results');
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

async function saveResult(jobId, result) {
  const file = path.join(resultsDir, `${jobId}.json`);
  console.log(`Saving result for job ${jobId}...`);
  await fs.promises.writeFile(file, JSON.stringify(result, null, 2));
}

async function getResult(jobId) {
  const file = path.join(resultsDir, `${jobId}.json`);
  if (!fs.existsSync(file)) return null;
  const data = await fs.promises.readFile(file, 'utf-8');
  return JSON.parse(data);
}

module.exports = { saveResult, getResult };
