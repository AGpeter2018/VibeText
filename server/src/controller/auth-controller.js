import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'fallback_client_id');

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET || 'vibetext_secret_key', { expiresIn: '7d' });
};

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify the Google JWT token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            // audience can be left empty or specified when we have a real client ID
        });
        
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;
        
        // Find or create user
        let user = await User.findOne({ googleId: sub });
        
        if (!user) {
            user = await User.create({
                googleId: sub,
                email,
                name,
                picture
            });
        }
        
        // Create our own JWT token for the session
        const token = createToken(user._id);
        
        res.status(200).json({ email, name, picture, token });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(400).json({ error: "Failed to authenticate with Google" });
    }
};
