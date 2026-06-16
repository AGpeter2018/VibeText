import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
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
        max: 10
    },
    upvotes: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Post = mongoose.model('Post', postSchema);

export default Post;
