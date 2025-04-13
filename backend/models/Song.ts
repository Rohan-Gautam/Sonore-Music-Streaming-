import mongoose, { Document, Schema } from 'mongoose';

interface ISong extends Document {
    title: string;
    artist: string;
    album?: string;
    duration: number; // In seconds
    url?: string; // Placeholder for song file URL
    createdAt: Date;
}

const songSchema = new Schema<ISong>({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    duration: { type: Number, required: true },
    url: { type: String }, // Optional: Add when you have song files
    createdAt: { type: Date, default: Date.now },
});

const Song = mongoose.model<ISong>('Song', songSchema);
export default Song;