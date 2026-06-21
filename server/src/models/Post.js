import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    originalText: {
        type: String,
        required: true,
    },
    tunedText: {
        type: String,
        required: true,
    },
    vibe: {
        type: String,
        required: true,
    },
    intensity: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    upvotedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
