import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { Types } from 'mongoose';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.signedCookies.auth;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }
    try {
        const user = await User.findById(userId).select('-password'); // Exclude password
        if (!user) {
            res.clearCookie('auth', { signed: true, httpOnly: true });
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        // Assign user data to req.user
        req.user = {
            _id: user._id as Types.ObjectId, // Explicit cast
            email: user.email,
            username: user.username,
            name: user.name,
            createdAt: user.createdAt,
        };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};