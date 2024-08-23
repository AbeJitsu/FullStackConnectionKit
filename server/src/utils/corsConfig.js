const cors = require('cors');

const allowedOrigins = [
  process.env.SERVER_CLOUD_FRONTEND_URL,
  process.env.SERVER_LOCAL_FRONTEND_URL,
].filter(Boolean); // Filter out any undefined values

const corsOptions = {
  origin: (origin, callback) => {
    console.log('Received request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS warning: Origin ${origin} not allowed`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
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
