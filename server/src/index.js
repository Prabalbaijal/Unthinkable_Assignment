  require('dotenv').config();
  const app = require('./app');
  const logger = require('./utils/logger');
  const { startWorkers } = require('./workers/ocrWorker');

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    logger.info(`Server listening on ${PORT}`);
  });

  startWorkers();
