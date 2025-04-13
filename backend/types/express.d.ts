import { Types } from 'mongoose';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            _id: Types.ObjectId;
            email: string;
            username?: string;
            name?: string;
            password?: string;
            createdAt?: Date;
        };
    }
}