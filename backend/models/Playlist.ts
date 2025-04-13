import { Schema, model, Document, Types } from 'mongoose';

interface IPlaylist extends Document {
    name: string;
    description: string;
    coverImage?: string;
    songs: Types.ObjectId[];
    createdBy: Types.ObjectId;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>(
    {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        coverImage: { type: String },
        songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model<IPlaylist>('Playlist', playlistSchema);