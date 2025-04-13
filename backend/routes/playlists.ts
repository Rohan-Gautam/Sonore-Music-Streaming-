import { Request, Response } from 'express';
import Playlist from '../models/Playlist';
import Song from '../models/Song';
import { supabase } from '../utils/supabaseClient';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

export const getPlaylists = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const playlists = await Playlist.find({ user: userId }).populate('songs', 'title artist url');
        res.status(200).json({ playlists });
    } catch (error: any) {
        console.error('Get playlists error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createPlaylist = [
    upload.single('coverImage'),
    async (req: Request, res: Response) => {
        const { name, description, tags, likes } = req.body;
        const userId = req.user?._id;
        const file = req.file;

        try {
            if (!name) {
                return res.status(400).json({ message: 'Playlist name is required' });
            }
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            let coverImageUrl: string | undefined;
            if (file) {
                const fileName = `playlist-${userId}-${Date.now()}.jpg`;
                const { error } = await supabase.storage.from('playlists').upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true,
                });
                if (error) {
                    console.error('Supabase upload error:', error);
                    return res.status(500).json({ message: 'Failed to upload cover image', error: error.message });
                }
                const { data } = supabase.storage.from('playlists').getPublicUrl(fileName);
                coverImageUrl = data.publicUrl;
            }

            const playlist = new Playlist({
                name,
                user: userId,
                songs: [],
                description,
                tags: tags ? JSON.parse(tags) : undefined,
                likes: likes ? parseInt(likes) : 0,
                coverImage: coverImageUrl,
            });

            await playlist.save();
            res.status(201).json({ message: 'Playlist created', playlist });
        } catch (error: any) {
            console.error('Create playlist error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
];