import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { registerUser } from './routes/register';
import { loginUser } from './routes/login';
import { logoutUser } from './routes/logout';
import { isAuthenticated } from './middleware/auth';
import { getPlaylists, createPlaylist, addSongsToPlaylist, deletePlaylist, removeSongsFromPlaylist, updatePlaylist, reorderPlaylist } from './routes/playlists';
import { searchSongs, getSongById } from './routes/songs';
import {getAccountInfo, updateAccount} from './routes/account';
import Song from './models/Song';
import { getUserProfile, updateUserProfile } from './routes/users';
import { getAllPublicPlaylists } from './routes/publicPlaylist';


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
const COOKIE_SECRET: string = process.env.COOKIE_SECRET || 'your_cookie_secret';

/**
 * Middleware setup
 * - cors: Allows requests from React frontend (e.g., localhost:5173 during dev)
 * - express.json: Parses JSON payloads for API routes
 * - express.static: Serves React build files from frontend/dist
 */

// Middleware
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'your_cookie_secret'));
app.use(express.static(path.join(__dirname, '../../frontend/dist')));


/**
 * MongoDB connection
 * Connects to the database before starting the server
 * Includes URI validation for robustness
 */


// MongoDB Connection
const connectDB = async (): Promise<void> => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('🚀 MongoDB connected');
        // Ensure the database is created

    } catch (error) {
        console.error('❌ MongoDB error:', error);
        process.exit(1);
    }
};




/**
 * API Routes
 * Placeholder for authentication routes (e.g., /api/auth/login)
 * Define all API routes under /api to avoid conflicts with React
 */
// app.use('/api/auth', authRoutes); // Add when implementing login/register

// Register Route
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/logout', logoutUser);
app.get('/api/auth/logout', logoutUser);

// Playlist routes
app.get('/api/playlists', isAuthenticated, getPlaylists);
app.post('/api/playlists/createPlaylist', isAuthenticated, createPlaylist);
app.post('/api/playlists/addSongsToPlaylist', isAuthenticated, addSongsToPlaylist);
app.post('/api/playlists/removeSongsFromPlaylist', isAuthenticated, removeSongsFromPlaylist);
app.delete('/api/playlists/deletePlaylist/:playlistId', isAuthenticated, deletePlaylist);
app.put('/api/playlists/updatePlaylist/:playlistId', isAuthenticated, updatePlaylist);
app.post('/api/playlists/:playlistId/reorder', isAuthenticated, reorderPlaylist);

//Public routes
app.get('/api/public-playlists', getAllPublicPlaylists);

// Song routes
app.get('/api/songs/search', isAuthenticated, searchSongs);
app.get('/api/songs/:songId', getSongById);

// Account routes
app.get('/api/account', isAuthenticated, getAccountInfo);
app.put('/api/account', isAuthenticated, updateAccount);


app.get('/api/users/me', isAuthenticated, getUserProfile);
app.put('/api/users/me', isAuthenticated, updateUserProfile);


/**
 * Serve React App
 * Catch-all route for all non-API requests
 * Sends React's index.html, letting React Router handle client-side routing
 */
// Protected API Routes
app.get('/api/home', isAuthenticated, (req: Request, res: Response) => {
    res.json({ message: 'Welcome to your home page', user: req.user });
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