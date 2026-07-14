import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow anonymous generations
    },
    vibe: {
        type: String,
        required: true,
    },
    intensity: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const Generation = mongoose.model('Generation', generationSchema);
export default Generation;
