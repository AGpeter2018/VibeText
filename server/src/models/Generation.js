import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    vibe: {
        type: String,
        required: true
    },
    intensity: {
        type: Number,
        default: 5
    }
}, { timestamps: true });

const Generation = mongoose.model('Generation', generationSchema);
export default Generation;
