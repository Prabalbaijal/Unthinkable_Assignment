const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const uploadRoutes = require('./routes/upload');
const jobRoutes = require('./routes/job');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/api', uploadRoutes);
app.use('/api', jobRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal error' });
});

module.exports = app;
