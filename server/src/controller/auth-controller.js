import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const adminEmails = [
    'adenijipeter2018@gmail.com',
    'peteradeniji2018@gmail.com',
    'agpeter2018@gmail.com'
];

const isAdminEmail = (email) => {
    if (!email) return false;
    return adminEmails.includes(email.toLowerCase().trim());
};

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, name, email, picture } = payload;

        let user = await User.findOne({ googleId });
        if (!user) {
            const role = isAdminEmail(email) ? 'admin' : 'user';
            user = await User.create({ googleId, name, email, picture, role });
        } else {
            // Update profile info on each login
            user.name = name;
            user.picture = picture;
            if (isAdminEmail(email)) user.role = 'admin';
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role,
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const role = isAdminEmail(email) ? 'admin' : 'user';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.password) {
            return res.status(401).json({ error: 'Please log in with Google' });
        }

        if (isAdminEmail(email) && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to log in' });
    }
};
