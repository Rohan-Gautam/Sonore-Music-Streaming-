import mongoose, { Document, Schema, Types } from 'mongoose';

interface IPlaylist extends Document {
    name: string;
    user: Types.ObjectId;
    songs: Types.ObjectId[];
    createdAt: Date;
    updatedAt?: Date;
    coverImage?: string;
    description?: string;
    likes?: number;
    tags?: string[];
}

const playlistSchema = new Schema<IPlaylist>(
    {
        name: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
        coverImage: { type: String },
        description: { type: String },
        likes: { type: Number, default: 0 },
        tags: { type: [String] },
    },
    { timestamps: true } // Auto-manages createdAt, updatedAt
);

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;