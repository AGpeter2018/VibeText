import mongoose from 'mongoose';

const vibeRequestSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed'],
        default: 'pending',
    }
}, { timestamps: true });

const VibeRequest = mongoose.model('VibeRequest', vibeRequestSchema);
export default VibeRequest;
