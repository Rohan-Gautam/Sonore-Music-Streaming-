import bcrypt from 'bcryptjs'; // Switch to bcryptjs for consistency
import { Request, Response } from 'express';
import User from './register'; // Ensure this path is correct

interface IUser {
    _id: string;
    email: string;
    password: string;
    username: string;
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email }) as IUser | null;
        if (!user) {
            return res.status(404).json({ message: 'User not registered on Sonore, Please register yourself first' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Set signed cookie
        res.cookie('auth', user._id.toString(), {
            signed: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Respond with success
        res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, email: user.email },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message,
        });
    }
};