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

export const uploadSong = async (req: Request, res: Response) => {
    const { title, artist, duration, album, releaseYear, genre, language, isExplicit, file } = req.body;
    const userId = req.user?._id;

    try {
        if (!title || !artist || !duration || !file) {
            return res.status(400).json({ message: 'Title, artist, duration, and file are required' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const base64Data = file.replace(/^data:audio\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `song-${userId}-${Date.now()}.mp3`;

        const { error } = await supabase.storage.from('songs').upload(fileName, buffer, {
            contentType: 'audio/mpeg',
        });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ message: 'Failed to upload song' });
        }

        const { data } = supabase.storage.from('songs').getPublicUrl(fileName);
        const song = new Song({
            title,
            artist,
            duration,
            album,
            releaseYear,
            genre,
            language,
            isExplicit,
            url: data.publicUrl,
        });

        await song.save();
        res.status(201).json({ message: 'Song uploaded', song });
    } catch (error: any) {
        console.error('Upload song error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};