import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    try {
        /**
         *  We now read the token from the HttpOnly cookie.
         * The browser automatically attaches it to every request
         * (because we set `withCredentials: true` on the Axios client).
         * JavaScript on the page can NEVER read this cookie — that's the security win.
         */
        const token = req.cookies?.vibetext_token;
        if (!token) {
            return res.status(401).json({ error: 'No session found. Please log in.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
