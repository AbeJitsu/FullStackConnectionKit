# FullStackConnectionKit

## Project Overview
FullStackConnectionKit is a MEVN (MongoDB, Express.js, Vue.js, Node.js) stack application demonstrating real-time updates using Server-Sent Events (SSE) and on-demand fetching. It supports both traditional Express server and serverless functions deployment, making it versatile for various hosting environments. The project is currently deployed on Vercel using a monorepo structure with separate projects for client and server components.

## Features
- RESTful API with Express.js, optimized for Vercel Serverless Functions
- MongoDB integration with Mongoose for robust data management
- Vue.js frontend with comprehensive API testing capabilities
- Server-Sent Events (SSE) for efficient real-time updates
- Serverless function support for scalable deployment on Vercel
- Environment-based configuration for seamless local and cloud deployment
- CORS configuration for secure cross-origin requests
- Error handling and logging system for improved debugging
- Counter operations with real-time updates

## Project Structure
- `/client`: Vue.js frontend application (deployed as a separate Vercel project)
- `/server`: Backend server (optimized for Vercel Serverless Functions)
  - `/api`: Serverless functions for Vercel deployment
  - `/src`: Source files for the Express server
    - `/db`: Database connection setup
    - `/middleware`: Custom middleware including error handling
    - `/models`: Mongoose models for MongoDB
    - `/routes`: API route definitions
    - `/utils`: Utility functions and configurations

## Setup and Installation
1. Clone the repository
2. Install dependencies:

npm install
cd client && npm install
cd ../server && npm install
text
3. Set up environment variables:
- Create `.env` files in both `/client` and `/server` directories
- Add necessary environment variables (see `.env.example` files)

## Running the Application
- For local development:

npm run dev
text
- For testing Vercel deployment locally:

vercel dev
text

## Deployment
The project is deployed on Vercel using a monorepo structure:
1. Two separate Vercel projects are set up: one for the client and one for the server.
2. Both projects are connected to the same GitHub repository.
3. The Root Directory setting in each Vercel project points to the respective folder (/client or /server).
4. Environment variables are configured separately for each Vercel project.
5. Automatic deployments are triggered for each project when changes are pushed to the main branch.

## API Documentation
- `/api/info`: Get system and database information
- `/api/items`: CRUD operations for items
- `/api/counter-operations`: Increment, decrement, and reset counters
- `/api/sse`: Server-Sent Events endpoint for real-time updates

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements
- [Express.js](https://expressjs.com/)
- [Vue.js](https://vuejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Vercel](https://vercel.com/)