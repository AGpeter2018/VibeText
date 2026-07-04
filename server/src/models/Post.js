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
    imageUrl: {
        type: String,
        required: false,
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
    replies: [{
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
    savesCount: {
        type: Number,
        default: 0,
    },
    sharesCount: {
        type: Number,
        default: 0,
    },
    authenticityScore: {
        type: Number,
        default: 0,
    },
    authenticityRatings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        note: {
            type: String,
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
