import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Song, { ISong } from '../models/Song';
import jsmediatags from 'jsmediatags';

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


interface ISongWithImage extends ISong {
    imageUrl?: string;
}

export const getSongById = async (req: Request, res: Response) => {
    try {
        const { songId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ message: 'Invalid song ID' });
        }

        const song = await Song.findById(songId).lean() as ISongWithImage;

        if (!song || !song.url) {
            return res.status(404).json({ message: 'Song not found or URL missing' });
        }

        // Extract image from song URL using jsmediatags
        try {
            await new Promise<void>((resolve, reject) => {
                jsmediatags.read(song.url!, {
                    onSuccess: (tag: jsmediatags.TagType) => {
                        if (tag.tags.picture) {
                            const { data, format } = tag.tags.picture;
                            song.imageUrl = `data:${format};base64,${Buffer.from(data).toString('base64')}`;
                        }
                        resolve();
                    },
                    onError: (error: Error) => {
                        console.warn('Failed to read song metadata:', error);
                        resolve();
                    },
                });
            });
        } catch (error) {
            console.warn('jsmediatags error:', error instanceof Error ? error.message : String(error));
        }

        res.status(200).json({
            message: 'Song retrieved successfully',
            song,
        });
    } catch (error) {
        console.error('Get song error:', error instanceof Error ? error.message : String(error));
        res.status(500).json({ message: 'Server error' });
    }
};