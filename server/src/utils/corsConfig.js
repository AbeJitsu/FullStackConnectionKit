const cors = require('cors');

const allowedOrigins = [
  process.env.SERVER_CLOUD_FRONTEND_URL,
  process.env.SERVER_LOCAL_FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    console.log('Received request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);

    if (process.env.CORS_TESTING === 'true') {
      console.log('CORS testing mode enabled. Allowing all origins.');
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      console.log(`Origin ${origin} is allowed.`);
      callback(null, true);
    } else {
      console.warn(`CORS warning: Origin ${origin} not allowed`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
  allowedHeaders: [
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Api-Version',
    'Authorization',
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400,
};

const corsMiddleware = cors(corsOptions);

const handleCors = (app) => {
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);

  // Explicit CORS headers for additional security
  app.use((req, res, next) => {
    if (process.env.CORS_TESTING === 'true') {
      res.header('Access-Control-Allow-Origin', '*');
      console.log('CORS testing mode: Allow-Origin set to *');
    } else {
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`Access-Control-Allow-Origin set to: ${origin}`);
      } else {
        console.warn(`Origin not allowed: ${origin}`);
      }
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
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

  console.log('CORS configuration validated successfully');
  console.log('Allowed origins:', allowedOrigins);
};

module.exports = { corsMiddleware, handleCors, validateCorsSetup };
