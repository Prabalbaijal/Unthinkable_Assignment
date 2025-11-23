const express = require('express');
const { getJobStatus } = require('../queues/ocrQueue');
const { getResult } = require('../services/storage');
const router = express.Router();

router.get('/job/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    const result = await getResult(jobId);
    if (result) {
      return res.json({ status: 'done', result });
    }

    const info = await getJobStatus(jobId);
    let status = 'pending';
    if (['active'].includes(info.state)) status = 'processing';
    else if (['completed'].includes(info.state)) status = 'done';
    else if (['failed'].includes(info.state)) status = 'failed';

    res.json({ status, progress: info.progress || 0, reason: info.reason || null });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

module.exports = router;
