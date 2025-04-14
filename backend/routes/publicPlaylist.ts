import mongoose, { Schema, Document, Types } from 'mongoose';
import { Request, Response, Router } from 'express';
import Song , { ISong } from '../models/Song';



interface IPublicPlaylist extends Document {
    name: string;
    songs: Types.ObjectId[];
    createdAt: Date;
    updatedAt?: Date;
    coverImage?: string;
    description?: string;
    category: string;
}

// PublicPlaylist schema
const publicPlaylistSchema = new Schema<IPublicPlaylist>(
    {
        name: {
            type: String,
            required: true,
        },
        songs: [{
            type: Schema.Types.ObjectId,
            ref: 'Song',
            default: [],
        }],
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
        },
        coverImage: {
            type: String,
            default: 'https://d2rd7etdn93tqb.cloudfront.net/wp-content/uploads/2022/03/spotify-playlist-cover-power-lines-music-notes-032322.jpg',
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            required: true,
            enum: ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'Other'],
        },
    },
    { timestamps: false }
);

// Models
const PublicPlaylist = mongoose.model<IPublicPlaylist>('PublicPlaylist', publicPlaylistSchema);

// Controller to get all public playlists, optionally filtered by category
export const getAllPublicPlaylists = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        // Build query
        const query: any = {};
        if (category && typeof category === 'string') {
            query.category = category;
        }

        // Fetch playlists and populate songs
        const playlists = await PublicPlaylist.find(query)
            .populate('songs', 'title artist duration')
            .lean();

        // Return empty array if no playlists exist
        if (!playlists || playlists.length === 0) {
            return res.status(200).json({
                message: 'No public playlists found',
                playlists: [],
            });
        }

        // Map playlists to include only necessary fields
        const playlistData = playlists.map(playlist => ({
            _id: playlist._id,
            name: playlist.name,
            description: playlist.description,
            coverImage: playlist.coverImage,
            songs: playlist.songs,
            category: playlist.category,
            createdAt: playlist.createdAt,
            updatedAt: playlist.updatedAt,
        }));

        res.status(200).json({
            message: 'Public playlists retrieved successfully',
            playlists: playlistData,
        });
    } catch (error: any) {
        console.error('Get all public playlists error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
