const Queue = require('bull');
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const queueName = process.env.OCR_QUEUE_NAME || 'ocrQueue';

const ocrQueue = new Queue(queueName, redisUrl);

ocrQueue.on('error', err => console.error('Redis Queue Error:', err));
ocrQueue.on('waiting', jobId => console.log('Job waiting:', jobId));
ocrQueue.on('active', job => console.log('Job active:', job.id));
ocrQueue.on('completed', job => console.log('Job completed:', job.id));
ocrQueue.on('failed', (job, err) => console.error('Job failed:', job.id, err));


// ------------------------------------------
// ADD JOB (now supports custom jobId)
// ------------------------------------------
async function enqueueFileForOCR(payload, jobId) {
  return await ocrQueue.add(payload, {
    jobId,   // <-- IMPORTANT: binds UUID jobId
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: false,
    removeOnFail: false
  });
}


// ------------------------------------------
// GET JOB STATUS
// ------------------------------------------
async function getJobStatus(jobId) {
  try {
    const job = await ocrQueue.getJob(jobId);
    if (!job) return { status: 'unknown' };

    const state = await job.getState();
    const progress = job._progress || 0;
    const reason = job.failedReason || null;

    return {
      id: job.id,
      state,
      progress,
      reason,
      data: job.data || null
    };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
}

module.exports = { ocrQueue, enqueueFileForOCR, getJobStatus };
