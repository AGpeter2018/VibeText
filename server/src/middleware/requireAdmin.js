import jwt from 'jsonwebtoken';

export const requireAdmin = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authorization.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        next();
    } catch (error) {
        res.status(401).json({ error: 'Request is not authorized' });
    }
};
