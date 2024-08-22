const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.SERVER_CLOUD_FRONTEND_URL,
      process.env.SERVER_LOCAL_FRONTEND_URL,
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS error: Origin ${origin} not allowed`);
      console.error(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const corsMiddleware = cors(corsOptions);

const handleCors = (router) => {
  router.use(corsMiddleware);
  router.options('*', corsMiddleware);
};

module.exports = { corsMiddleware, handleCors };
