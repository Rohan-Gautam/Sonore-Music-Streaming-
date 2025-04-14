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
        description: { type: String, default: '' },
        coverImage: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
    },
    { timestamps: true } // Auto-manages createdAt, updatedAt
);

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;