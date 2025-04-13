import mongoose, { Document, Schema, Types } from 'mongoose';

interface IPlaylist extends Document {
    name: string;
    user: Types.ObjectId;
    songs: Types.ObjectId[];
    createdAt: Date;
}

const playlistSchema = new Schema<IPlaylist>({
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    createdAt: { type: Date, default: Date.now },
});

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;