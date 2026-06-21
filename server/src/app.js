import express from 'express'
import cors from 'cors'
import { generateContent } from '../controller/ai-controller.js'
import authRoutes from './routes/auth-route.js'
import feedRoutes from './routes/feed-route.js'

const app = express()
// Middleware

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.indexOf(origin + '/') !== -1) {
            callback(null, true);
        } else {
            console.log('CORS Refused for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204
}));

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.status(200).json({ message: 'VibeText API is running...' });
});

// Routes
app.post('/api/tune', generateContent);
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);

export default app