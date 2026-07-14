import mongoose from 'mongoose';

const weeklyVibeSchema = new mongoose.Schema({
    vibeName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    weekStart: {
        type: Date,
        required: true,
    },
    weekEnd: {
        type: Date,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const WeeklyVibe = mongoose.model('WeeklyVibe', weeklyVibeSchema);
export default WeeklyVibe;
