import { Request, Response } from 'express';
import Song from '../models/Song';
import { supabase } from '../utils/supabaseClient';

export const searchSongs = async (req: Request, res: Response) => {
    const { q } = req.query;

    try {
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const songs = await Song.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { artist: { $regex: q, $options: 'i' } },
            ],
        }).limit(10);

        res.status(200).json({ songs });
    } catch (error: any) {
        console.error('Search songs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};