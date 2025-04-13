import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    profilePicture?: string;
    playlists: Types.ObjectId[];
    likedSongs: Types.ObjectId[];
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePicture: { type: String },
        playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
        likedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>('User', userSchema);