// server/models/Expense.js (Example with business credit fields)
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    type: { // 'personal' or 'business'
        type: String,
        enum: ['personal', 'business'],
        default: 'personal',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Store Credit'],
        default: 'Cash',
    },
    // Fields specifically for business credit tracking
    isBusinessCreditPaid: {
        type: Boolean,
        default: true, // Default to true, only false if paymentMethod is 'Store Credit' for business expenses
    },
    paidWithMethod: { // Method used when the business credit was settled
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'], // Only actual payment methods
        required: function() { return this.isBusinessCreditPaid === true && this.paymentMethod === 'Store Credit'; }
    },
    paidDate: { // Date when the business credit was settled
        type: Date,
        required: function() { return this.isBusinessCreditPaid === true && this.paymentMethod === 'Store Credit'; }
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);