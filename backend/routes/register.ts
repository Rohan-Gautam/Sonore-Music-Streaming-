import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/User';



export const registerUser = async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username: username || '' }],
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: { email, username },
        });
    } catch (error: any) {
        console.error('Detailed registration error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => ({
                field: err.path,
                message: err.message || `Invalid value for ${err.path}`,
            }));
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message,
        });
    }
};

export default User;