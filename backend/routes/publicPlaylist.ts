import mongoose, { Schema, Document } from 'mongoose';
import { Request, Response } from 'express';

// Define interfaces for TypeScript
interface ISong extends Document {
    title: string;
    artist: string;
    duration: number;
}

interface IPublicPlaylist extends Document {
    name: string;
    description: string;
    songs: mongoose.Types.ObjectId[];
    coverImage: string;
}

// Song schema (assuming songs are referenced from a Song collection)
const songSchema = new Schema<ISong>({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in seconds
});

// PublicPlaylist schema
const publicPlaylistSchema = new Schema<IPublicPlaylist>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song',
        default: [],
    }],
    coverImage: {
        type: String,
        default: 'https://marketplace.canva.com/EAGJJYJvO-8/1/0/1600w/canva-purple-gradient-modern-80s-aesthetic-timeless-tunes-playlist-cover-llEskz_MyBg.jpg',
    },
});

// Models
const Song = mongoose.model<ISong>('Song', songSchema);
const PublicPlaylist = mongoose.model<IPublicPlaylist>('PublicPlaylist', publicPlaylistSchema);

// Controller to get public playlist info and songs
export const getPublicPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;

        // Validate playlistId format
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return res.status(400).json({ message: 'Invalid playlist ID' });
        }

        // Find playlist and populate songs
        const playlist = await PublicPlaylist.findById(playlistId)
            .populate('songs', 'title artist duration') // Populate only specific song fields
            .lean(); // Convert to plain JSON for lightweight response

        if (!playlist) {
            return res.status(404).json({ message: 'Public playlist not found' });
        }

        res.status(200).json({
            message: 'Public playlist retrieved successfully',
            playlist: {
                _id: playlist._id,
                name: playlist.name,
                description: playlist.description,
                coverImage: playlist.coverImage,
                songs: playlist.songs,
            },
        });
    } catch (error: any) {
        console.error('Get public playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default PublicPlaylist;