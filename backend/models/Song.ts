import mongoose, { Document, Schema } from 'mongoose';

export interface ISong extends Document {
    title: string;
    artist: string;
    duration: number;
    createdAt: Date;
    album?: string;
    releaseYear?: number;
    genre?: string[];
    language?: string;
    isExplicit?: boolean;
    url?: string; // Supabase URL
}

const songSchema = new Schema<ISong>({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    album: { type: String },
    releaseYear: { type: Number },
    genre: { type: [String] },
    language: { type: String },
    isExplicit: { type: Boolean, default: false },
    url: { type: String }, // e.g., https://your-supabase-project.supabase.co/storage/v1/object/public/songs/song-id.mp3
});

const Song = mongoose.model<ISong>('Song', songSchema);
export default Song;
