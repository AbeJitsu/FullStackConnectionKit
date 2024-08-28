# FullStackConnectionKit

## Project Overview
FullStackConnectionKit is a MEVN (MongoDB, Express.js, Vue.js, Node.js) stack application demonstrating real-time updates using Server-Sent Events (SSE) and on-demand fetching. It supports both traditional Express server and serverless functions deployment, making it versatile for various hosting environments. The project is currently undergoing a transition to fully support Vercel Serverless Functions (VSF) for cloud deployment.

## Features
- RESTful API with Express.js (transitioning to Vercel Serverless Functions)
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
- `/server`: Backend server (transitioning to Vercel Serverless Functions)
  - `/api`: Serverless functions for Vercel deployment
  - `/src`: Source files for the traditional Express server
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
- For local development (using traditional Express server):

npm run dev
text
- For production (using Vercel Serverless Functions):
- Deploy to Vercel (see Deployment section)

## Deployment
- Vercel:
1. Connect your GitHub repository to Vercel
2. Create two separate projects in Vercel dashboard (one for client, one for server)
3. Configure the project settings in Vercel dashboard for each project
4. Set up environment variables in Vercel
5. Deploy using Vercel's automatic deployment

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