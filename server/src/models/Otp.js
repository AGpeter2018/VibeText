import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m' // Automatically deletes this document from MongoDB after 5 minutes!
    }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
