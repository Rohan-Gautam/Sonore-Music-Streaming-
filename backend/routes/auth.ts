import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.signedCookies || !req.signedCookies.auth) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Proceed if authenticated
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

