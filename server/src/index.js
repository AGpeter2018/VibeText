import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config(); // Try loading from current working directory (.env in root)
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath }); // Keep fallback for existing structure

const startServer = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibetext';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');

        const PORT = process.env.PORT || 5000;

        const httpServer = createServer(app);
        const io = new Server(httpServer, {
            cors: {
                origin: [
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:5174",
                    process.env.CLIENT_URL
                ].filter(Boolean),
                methods: ["GET", "POST"]
            }
        });

        // Attach io to the Express app context so controllers can access it
        app.set('io', io);

        // Handle user-specific socket rooms for targeted notifications
        io.on('connection', (socket) => {
            // Client should emit 'join_room' with their userId after connecting
            socket.on('join_room', (userId) => {
                if (userId) {
                    socket.join(userId);
                }
            });
        });

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

        app.on('error', (error) => {
            console.error(`Server error: ${error.message}`);
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();