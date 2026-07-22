import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
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

export const verifyOAuth = async (req, res) => {
    try {
        const { code, provider } = req.body;

        if (provider !== 'discord') {
            return res.status(400).json({ error: 'Unsupported provider' });
        }

        const params = new URLSearchParams();
        params.append('client_id', String(process.env.DISCORD_CLIENT_ID).trim());
        params.append('client_secret', String(process.env.DISCORD_CLIENT_SECRET).trim());
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', `${(process.env.CLIENT_URL || 'http://localhost:5173').trim()}/oauth/callback`);

        console.log('Debug Discord Payload (URLSearchParams):', params.toString());

        // 1. Exchange code for access token via Discord API
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;

        // 2. Use access token to fetch Discord user profile
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { id: discordId, username, email, avatar } = userResponse.data;
        const picture = avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : null;

        if (!email) {
            return res.status(400).json({ error: 'Discord account must have a verified email' });
        }

        // 3. Authenticate or Register User
        let user = await User.findOne({ email });

        if (!user) {
            const role = isAdminEmail(email) ? 'admin' : 'user';
            user = await User.create({ discordId, name: username, email, picture, role });
        } else {
            // Update profile with Discord data
            user.discordId = discordId;
            if (!user.picture && picture) user.picture = picture;
            if (isAdminEmail(email)) user.role = 'admin';
            await user.save();
        }

        // 4. Generate internal JWT
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
        const discordErrorMsg = error.response?.data ? error.response.data : error.message;
        const debugPayload = {
            client_id: process.env.DISCORD_CLIENT_ID,
            grant_type: 'authorization_code',
            code: req.body.code,
            redirect_uri: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/oauth/callback` : 'http://localhost:5173/oauth/callback'
        };
        console.error('OAuth verification error:', discordErrorMsg);
        res.status(500).json({ error: 'invalid_request', details: discordErrorMsg, debugPayload });
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
