import { Schema, model, Document } from 'mongoose';

interface ISong extends Document {
    title: string;
    artist: string;
    url: string;
    duration: number;
}

const songSchema = new Schema<ISong>({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, required: true },
});

export default model<ISong>('Song', songSchema);