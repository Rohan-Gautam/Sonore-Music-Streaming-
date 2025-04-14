// models/Playlist.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

interface IPlaylist extends Document {
    name: string;
    user: Types.ObjectId;
    songs: Types.ObjectId[];
    createdAt: Date;
    updatedAt?: Date;
    coverImage?: string;
    description?: string;
}

const playlistSchema = new Schema<IPlaylist>(
    {
        name: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
        description: { type: String, default: 'No Description' },
        coverImage: { type: String, default: 'https://marketplace.canva.com/EAGJJYJvO-8/1/0/1600w/canva-purple-gradient-modern-80s-aesthetic-timeless-tunes-playlist-cover-llEskz_MyBg.jpg' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
    },
    { timestamps: true } // Auto-manages createdAt, updatedAt
);

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;