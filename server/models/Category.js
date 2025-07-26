const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false, // Not unique globally, as different users can have same category names
        trim: true
    },
    type: { // 'personal' or 'business'
        type: String,
        enum: ['personal', 'business'],
        required: true
    },
    user: { // Link to the user who owns this category
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user cannot have two categories with the same name and type
categorySchema.index({ name: 1, type: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);