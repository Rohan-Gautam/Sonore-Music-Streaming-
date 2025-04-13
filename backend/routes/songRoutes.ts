import express from 'express';
import { getAllSongs, getSongById, createSong } from '../controllers/songController';

const router = express.Router();

// Get all songs
router.get('/', getAllSongs);

// Get song by ID
router.get('/:id', getSongById);

// Create new song
router.post('/', createSong);

export default router;