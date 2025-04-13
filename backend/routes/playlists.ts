import { Request, Response } from 'express';
import Playlist from '../models/Playlist';
import Song from '../models/Song';

export const getPlaylists = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const playlists = await Playlist.find({ user: userId }).populate('songs', 'title artist');
        res.status(200).json({ playlists });
    } catch (error: any) {
        console.error('Get playlists error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createPlaylist = async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = req.user?._id;

    try {
        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const playlist = new Playlist({ name, user: userId, songs: [] });
        await playlist.save();
        res.status(201).json({ message: 'Playlist created', playlist });
    } catch (error: any) {
        console.error('Create playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};