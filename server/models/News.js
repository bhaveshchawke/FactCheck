const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow anonymous checks? Plan says Login required. But maybe detailed analysis needs login. Let's keep strict for now.
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'url', 'headline'],
        default: 'text'
    },
    analysisResult: {
        score: Number, // 0-100
        category: {
            type: String,
            enum: ['Real', 'Doubtful', 'Fake']
        },
        breakdown: {
            keywordScore: Number,
            domainScore: Number,
            apiScore: Number,
            communityScore: Number
        },
        matchedClaims: [Object],
        heuristicReasons: [String],
        aiAnalysis: Object, // Added to schema
        searchResults: [Object] // Added to schema
    },
    votes: {
        up: { type: Number, default: 0 }, // Agree with result
        down: { type: Number, default: 0 } // Disagree
    },
    reports: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: String,
            date: { type: Date, default: Date.now }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('News', NewsSchema);
