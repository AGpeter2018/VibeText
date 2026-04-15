import express from 'express'
import cors from 'cors'
import aiRouter from './routes/ai-route.js';
import { generateContent } from './controller/ai-controller.js';

const app = express()
// Middleware

// CORS configuration
const allowedOrigins = [
    'http://127.0.0.1:5173',
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
app.use('/api', aiRouter);
// app.post('/api/tune-direct', generateContent);

export default app