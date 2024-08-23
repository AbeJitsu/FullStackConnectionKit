const cors = require('cors');

const allowedOrigins = [
  process.env.SERVER_CLOUD_FRONTEND_URL,
  process.env.SERVER_LOCAL_FRONTEND_URL,
].filter(Boolean);

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
  optionsSuccessStatus: 204,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400,
};

const corsMiddleware = cors(corsOptions);

const handleCors = (app) => {
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);

  // Explicit CORS headers for additional security
  app.use((req, res, next) => {
    // Temporary testing configuration
    if (process.env.CORS_TESTING === 'true') {
      res.header('Access-Control-Allow-Origin', '*');
    } else {
      res.header('Access-Control-Allow-Origin');
    }
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
};

const validateCorsSetup = () => {
  if (allowedOrigins.length === 0) {
    console.error('ERROR: No allowed origins specified for CORS');
    process.exit(1);
  }

  if (
    !process.env.SERVER_CLOUD_FRONTEND_URL ||
    !process.env.SERVER_LOCAL_FRONTEND_URL
  ) {
    console.warn('WARNING: Some CORS environment variables are not set');
  }

  if (process.env.CORS_TESTING === 'true') {
    console.warn(
      'WARNING: CORS testing mode is enabled. Do not use in production!'
    );
  }
};

module.exports = { corsMiddleware, handleCors, validateCorsSetup };
