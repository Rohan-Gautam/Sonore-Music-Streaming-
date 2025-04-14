// controllers/playlists.ts
import { Request, Response } from 'express';
import Playlist from '../models/Playlist';
import Song from '../models/Song';
import mongoose from "mongoose";

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

export const createPlaylist = async (req: Request, res: Response) => {
    const { name, description, coverImageUrl } = req.body;
    const userId = req.user?._id;

    try {
        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const playlist = new Playlist({
            name,
            user: userId,
            songs: [],
            description,
            coverImage: coverImageUrl || undefined,
        });

        await playlist.save();
        res.status(201).json({ message: 'Playlist created', playlist });
    } catch (error: any) {
        console.error('Create playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add songs to playlist
export const addSongsToPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId, songIds } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!playlistId || !songIds || !Array.isArray(songIds)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        // Check if playlist exists and belongs to the user
        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or access denied' });
        }

        // Check if songs exist
        const songs = await Song.find({ _id: { $in: songIds } });
        if (songs.length !== songIds.length) {
            return res.status(400).json({ message: 'One or more songs not found' });
        }

        // Add songs to playlist (avoiding duplicates)
        const currentSongIds = playlist.songs.map(id => id.toString());
        const newSongIds = songIds.filter(id => !currentSongIds.includes(id.toString()));

        if (newSongIds.length > 0) {
            playlist.songs = [...playlist.songs, ...newSongIds];
            await playlist.save();
        }

        res.status(200).json({
            message: 'Songs added to playlist',
            playlist: await Playlist.findById(playlistId).populate('songs', 'title artist url')
        });
    } catch (error: any) {
        console.error('Add songs to playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove songs from playlist
export const removeSongsFromPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId, songIds } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!playlistId || !songIds || !Array.isArray(songIds)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        // Check if playlist exists and belongs to the user
        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or access denied' });
        }

        // Remove songs from playlist
        playlist.songs = playlist.songs.filter(songId =>
            !songIds.includes(songId.toString())
        );

        await playlist.save();

        res.status(200).json({
            message: 'Songs removed from playlist',
            playlist: await Playlist.findById(playlistId).populate('songs', 'title artist url')
        });
    } catch (error: any) {
        console.error('Remove songs from playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete playlist
export const deletePlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if playlist exists and belongs to the user
        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or access denied' });
        }

        // Delete playlist
        await Playlist.deleteOne({ _id: playlistId });

        res.status(200).json({ message: 'Playlist deleted successfully' });
    } catch (error: any) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Rename playlist or update details
export const updatePlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const { name, description, coverImageUrl } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }

        // Check if playlist exists and belongs to the user
        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or access denied' });
        }

        // Update playlist
        playlist.name = name;

        // Only update these fields if they're provided
        if (description !== undefined) {
            playlist.description = description;
        }

        if (coverImageUrl !== undefined) {
            playlist.coverImage = coverImageUrl;
        }

        await playlist.save();

        res.status(200).json({
            message: 'Playlist updated',
            playlist: await Playlist.findById(playlistId).populate('songs', 'title artist url')
        });
    } catch (error: any) {
        console.error('Update playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



export const reorderPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const { songIds } = req.body;
        const userId = req.user?._id;

        console.log('Received playlistId:', playlistId, 'songIds:', songIds);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!playlistId || !songIds || !Array.isArray(songIds)) {
            console.log('Invalid request data:', { playlistId, songIds });
            return res.status(400).json({ message: 'Invalid request data' });
        }

        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            console.log('Playlist not found:', playlistId);
            return res.status(404).json({ message: 'Playlist not found or access denied' });
        }

        const currentSongIds = playlist.songs.map(id => id.toString());
        console.log('Current playlist songIds:', currentSongIds);
        const invalidIds = songIds.filter((id: any) => !currentSongIds.includes(String(id)));
        if (invalidIds.length > 0) {
            console.log('Invalid song IDs detected:', invalidIds);
            return res.status(400).json({ message: 'One or more song IDs are invalid' });
        }

        playlist.songs = songIds.map(id => new mongoose.Types.ObjectId(id));
        await playlist.save();

        res.status(200).json({
            message: 'Playlist order updated successfully',
            playlist: await Playlist.findById(playlistId).populate('songs', 'title artist url')
        });
    } catch (error: any) {
        console.error('Reorder playlist error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};