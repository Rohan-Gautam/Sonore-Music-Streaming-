import { Request, Response } from 'express';
import Song from '../models/Song';

/**
 * Get all songs
 * @route GET /api/songs
 * @access Public
 */
export const getAllSongs = async (req: Request, res: Response) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Get song by ID
 * @route GET /api/songs/:id
 * @access Public
 */
export const getSongById = async (req: Request, res: Response) => {
    try {
        const song = await Song.findById(req.params.id);
        
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        
        res.status(200).json(song);
    } catch (error) {
        console.error('Error fetching song:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Create new song
 * @route POST /api/songs
 * @access Private/Admin
 */
export const createSong = async (req: Request, res: Response) => {
    try {
        const { title, artist, url, duration } = req.body;
        
        if (!title || !artist || !url || !duration) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        const newSong = new Song({
            title,
            artist,
            url,
            duration
        });
        
        const savedSong = await newSong.save();
        res.status(201).json(savedSong);
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};