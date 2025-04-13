import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

/**
 * Initialize environment variables
 * Loads variables from .env file into process.env
 * Ensure .env exists with PORT, MONGO_URI, and FRONTEND_URL
 */
dotenv.config();

/**
 * Create Express app instance
 */
const app: Express = express();

/**
 * Define constants from environment variables
 * Fallbacks ensure the app runs if .env is missing
 */
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/sonore';
const FRONTEND_URL: string = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Middleware setup
 * - cors: Allows requests from React frontend (e.g., localhost:5173 during dev)
 * - express.json: Parses JSON payloads for API routes
 * - express.static: Serves React build files from frontend/dist
 */
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

/**
 * MongoDB connection
 * Connects to the database before starting the server
 * Includes URI validation for robustness
 */
const connectDB = async (): Promise<void> => {
    try {
        if (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
            throw new Error('Invalid MONGO_URI: Must start with "mongodb://" or "mongodb+srv://"');
        }
        console.log(`Attempting to connect to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        process.exit(1);
    }
};

/**
 * API Routes
 * Placeholder for authentication routes (e.g., /api/auth/login)
 * Define all API routes under /api to avoid conflicts with React
 */
// app.use('/api/auth', authRoutes); // Add when implementing login/register

/**
 * Serve React App
 * Catch-all route for all non-API requests
 * Sends React's index.html, letting React Router handle client-side routing
 */
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
    // Note: Ensure API routes (e.g., /api/*) are defined above to avoid being caught here
});

/**
 * Start the server
 * Connects to MongoDB and starts listening on PORT
 */
const startServer = async (): Promise<void> => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
};

/**
 * Initialize the server
 */
startServer();

/**
 * Handle graceful shutdown
 * Closes MongoDB connection on process termination
 */
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received. Closing server...');
    await mongoose.connection.close();
    process.exit(0);
});

/**
 * How to extend this server:
 * 1. **API Routes**: Add routes in src/routes/ (e.g., authRoutes.ts for /api/auth).
 *    Example: POST /api/auth/login to handle user login.
 * 2. **Models**: Define schemas in src/models/ (e.g., User.ts for authentication).
 *    Example: User model with email, passwordHash, name.
 * 3. **Controllers**: Add logic in src/controllers/ (e.g., authController.ts).
 * 4. **Authentication**: Implement JWT or OAuth for login/register.
 * 5. **Features**: Add song routes (/api/songs), playlist routes (/api/playlists).
 * 6. **Middleware**: Add rate-limiting, error handling, or logging.
 *    Example: express-rate-limit for API security.
 * 7. **Deployment**: Deploy to Render/Heroku, ensure frontend/dist is built.
 */