import { Request, Response } from 'express';
import User from '../models/User';
import { supabase } from '../utils/supabaseClient';
import bcrypt from 'bcryptjs';


export const updateAccount = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, username, password } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // ✅ Get session inside this function
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            return res.status(401).json({ message: 'Unauthorized - invalid session' });
        }

        const updates: any = {};
        if (name) updates.name = name;
        if (username) updates.username = username;
        if (password) updates.password = await bcrypt.hash(password, 10);


        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Account updated', user: { name: user.name, username: user.username, email: user.email } });
    } catch (error: any) {
        console.error('Update account error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};