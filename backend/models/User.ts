import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
    name?: string;
    username?: string;
    email: string;
    password: string;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, sparse: true },
    username: { type: String, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;