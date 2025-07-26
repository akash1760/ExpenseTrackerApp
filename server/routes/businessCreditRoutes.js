// server/routes/businessCreditRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Make sure authMiddleware is correctly imported
const Expense = require('../models/Expense'); // Assuming Business Credit is managed through Expense model

// @desc    Get all unpaid business credits
// @route   GET /api/business-credits
// @access  Private (requires authentication)
router.get('/', protect, async (req, res) => {
    try {
        // Find expenses that are of type 'business' and are not yet paid
        const businessCredits = await Expense.find({
            user: req.user.id, // Ensure user ID is from authenticated user
            type: 'business',
            paymentMethod: 'Store Credit', // Only those paid via 'Store Credit' are considered for this page
            isBusinessCreditPaid: false // Only unpaid ones
        }).populate('category', 'name'); // Populate category name

        res.json(businessCredits);
    } catch (error) {
        console.error('Error fetching business credits:', error);
        res.status(500).json({ message: 'Server Error: Failed to fetch business credits' });
    }
});

// @desc    Mark a business credit as paid
// @route   PUT /api/business-credits/pay/:id
// @access  Private
router.put('/pay/:id', protect, async (req, res) => {
    try {
        const { paymentMethod, paymentDate } = req.body; // Expect paymentMethod and paymentDate from frontend

        const credit = await Expense.findOne({ _id: req.params.id, user: req.user.id, type: 'business' });

        if (!credit) {
            return res.status(404).json({ message: 'Business credit not found or not authorized' });
        }

        if (credit.isBusinessCreditPaid) {
            return res.status(400).json({ message: 'This business credit is already marked as paid.' });
        }

        credit.isBusinessCreditPaid = true;
        credit.paidWithMethod = paymentMethod; // Store how it was paid
        credit.paidDate = paymentDate || new Date(); // Store when it was paid

        await credit.save();
        res.json({ message: 'Business credit marked as paid', credit });

    } catch (error) {
        console.error('Error marking business credit as paid:', error);
        res.status(500).json({ message: 'Server Error: Failed to mark credit as paid' });
    }
});


module.exports = router;