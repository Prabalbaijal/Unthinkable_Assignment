const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const { enqueueFileForOCR } = require('../queues/ocrQueue');
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>  
    cb(null, `${Date.now()}-${Math.floor(Math.random() * 1e6)}-${file.originalname}`)
});

const upload = multer({ storage });

// ----- FIXED WITH UUID -----
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const payload = {
    filePath: req.file.path,
    mime: req.file.mimetype,
    originalName: req.file.originalname,
    uploadedAt: new Date().toISOString()
  };

  // create a unique jobId
  const customId = uuid();

  // pass custom jobId to queue
  await enqueueFileForOCR(payload, customId);

  res.status(202).json({
    jobId: customId,
    message: 'File accepted, OCR job enqueued.'
  });
});

module.exports = router;
