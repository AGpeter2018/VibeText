import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });



const startServer = async () => {
    try {

        // Give mongoose a moment to fully initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        app.on('error', (error) => {
            console.error(`Server error: ${error.message}`);
        });


    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();