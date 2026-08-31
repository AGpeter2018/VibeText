import jwt from 'jsonwebtoken';

export const requireAdmin = (req, res, next) => {
    try {
        //  Read from HttpOnly cookie — same as requireAuth
        const token = req.cookies?.vibetext_token;
        if (!token) {
            return res.status(401).json({ error: 'No session found. Please log in.' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
