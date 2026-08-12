import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Otp from '../models/Otp.js';

const adminEmails = [
    'adenijipeter2018@gmail.com',
    'peteradeniji2018@gmail.com',
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
            _id: user._id,
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

export const googleTokenAuth = async (req, res) => {
    try {
        const { accessToken, userInfo } = req.body;
        if (!accessToken || !userInfo) {
            return res.status(400).json({ error: 'Access token and user info are required' });
        }

        // Verify the token is valid by calling Google's userinfo endpoint
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { sub: googleId, name, email, picture } = googleRes.data;

        if (!email) {
            return res.status(400).json({ error: 'Google account must have a verified email' });
        }

        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            const role = isAdminEmail(email) ? 'admin' : 'user';
            user = await User.create({ googleId, name, email, picture, role });
        } else {
            user.googleId = googleId;
            user.name = name;
            user.picture = picture;
            if (isAdminEmail(email)) user.role = 'admin';
            await user.save();
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role,
        });
    } catch (error) {
        console.error('Google token auth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
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
            _id: user._id,
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

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Upsert OTP in database (will automatically expire in 5 min due to TTL)
        await Otp.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { otp: otpCode },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const smtpPort = Number(process.env.SMTP_PORT) || 587;
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 10000
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"VibeText Security" <noreply@vibetext.com>',
                to: email,
                subject: "Your VibeText Login Code",
                text: `Your one-time passcode is: ${otpCode}. It expires in 5 minutes.`,
                html: `<h3>Welcome to VibeText!</h3><p>Your one-time passcode is: <b>${otpCode}</b>.</p><p>It expires in 5 minutes.</p>`
            });
        } else {
            // Local fallback logic since Ethereal Mail port 587 is blocked by ISP.
            console.log("\n=========================================");
            console.log(`⚠️ NO SMTP CREDENTIALS IN .ENV!`);
            console.log(`📧 Simulated Email to: ${email}`);
            console.log(`🔑 YOUR LOGIN OTP IS: ${otpCode}`);
            console.log("=========================================\n");
        }

        res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        const errContext = (error.message || '').toLowerCase().includes('timeout')
            ? 'SMTP Blocked: Render Free Tier firewall prevents outgoing emails. Run locally or upgrade Render.'
            : 'SMTP Error: Failed to send verification email. Check App Passwords.';
        res.status(500).json({ error: errContext });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, name } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const cleanEmail = email.toLowerCase().trim();
        const record = await Otp.findOne({ email: cleanEmail });

        if (!record || record.otp !== otp) {
            return res.status(401).json({ error: 'Invalid or expired OTP code' });
        }

        // OTP is valid! Destroy it so it can't be reused
        await Otp.findByIdAndDelete(record._id);

        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            const role = isAdminEmail(cleanEmail) ? 'admin' : 'user';
            // Default to parsed name if no name provided
            const finalName = name || cleanEmail.split('@')[0];
            user = await User.create({ name: finalName, email: cleanEmail, role });
        } else {
            if (isAdminEmail(cleanEmail) && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role,
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: 'Verification failed' });
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
