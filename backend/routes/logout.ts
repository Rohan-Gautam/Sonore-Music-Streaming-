import { Request, Response } from 'express';

export const logoutUser = (req: Request, res: Response) => {
    res.clearCookie('auth', {
        signed: true,
        httpOnly: true
    });

    res.status(200).json({ message: 'Logged out successfully' });
};