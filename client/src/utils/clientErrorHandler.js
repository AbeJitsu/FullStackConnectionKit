// clientErrorHandler.js

import { v4 as uuidv4 } from 'uuid';

const clientErrorHandler = (error, context) => {
  const errorId = uuidv4();

  // Log the error with the unique identifier and context details
  console.error(`Error ID ${errorId}:`, {
    error,
    context,
  });

  // Set default values
  let status = error.response?.status || 500;
  let message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message || 'An unexpected error occurred';
  let errorCode = error.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.response) {
    status = error.response.status;
    message = error.response.data?.message || message;
    errorCode = error.response.data?.errorCode || errorCode;
  } else if (error.request) {
    status = 0;
    message = 'No response received from the server';
    errorCode = 'NO_RESPONSE';
  }

  // Prepare the error response
  const errorResponse = {
    status: 'error',
    errorCode,
    message,
    errorId,
    timestamp: new Date().toISOString(),
  };

  // Include additional information in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  return errorResponse;
};

export default clientErrorHandler;
