const rateLimit = require('express-rate-limit');
module.exports = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60*1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 60
});
