const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/expenses
// @desc Add a new expense
// @access Private
router.post('/', protect, async (req, res) => {
    const { amount, description, category, type, date, paymentMethod, isBusinessCreditPaid } = req.body;

    try {
        const newExpense = new Expense({
            amount,
            description,
            category,
            type,
            date: date || new Date(), // Use provided date or current date
            paymentMethod,
            isBusinessCreditPaid: type === 'business' && paymentMethod === 'Store Credit' ? false : true, // Logic for credit
            user: req.user.id
        });
        await newExpense.save();
        // Populate category details if needed for immediate response
        const populatedExpense = await newExpense.populate('category', 'name type');
        res.status(201).json(populatedExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding expense', error: error.message });
    }
});

// @route GET /api/expenses
// @desc Get all expenses for the logged-in user with filters
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const { startDate, endDate, category, type, paymentMethod, isBusinessCreditPaid } = req.query;
        const query = { user: req.user.id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate).setHours(0, 0, 0, 0),
                $lte: new Date(endDate).setHours(23, 59, 59, 999)
            };
        } else if (startDate) { // For a single day
            query.date = {
                $gte: new Date(startDate).setHours(0, 0, 0, 0),
                $lte: new Date(startDate).setHours(23, 59, 59, 999)
            };
        }

        if (category) {
            query.category = category; // Expects category ID
        }
        if (type) {
            query.type = type;
        }
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }
        if (isBusinessCreditPaid !== undefined) {
             // Convert string to boolean for query
            query.isBusinessCreditPaid = isBusinessCreditPaid === 'true';
        }


        const expenses = await Expense.find(query)
            .populate('category', 'name type') // Populate category name and type
            .sort({ date: -1, createdAt: -1 }); // Sort by newest first

        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching expenses', error: error.message });
    }
});

// @route GET /api/expenses/:id
// @desc Get a single expense by ID
// @access Private
router.get('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id }).populate('category', 'name type');
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.status(200).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching expense' });
    }
});

// @route PUT /api/expenses/:id
// @desc Update an expense
// @access Private
router.put('/:id', protect, async (req, res) => {
    const { amount, description, category, type, date, paymentMethod, isBusinessCreditPaid } = req.body;
    try {
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { amount, description, category, type, date, paymentMethod, isBusinessCreditPaid },
            { new: true } // Return the updated document
        ).populate('category', 'name type');

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating expense', error: error.message });
    }
});

// @route DELETE /api/expenses/:id
// @desc Delete an expense
// @access Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting expense' });
    }
});


// --- Reporting Routes ---

// @route GET /api/expenses/reports/daily/:date
// @desc Get daily expense summary for a user
// @access Private
router.get('/reports/daily/:date', protect, async (req, res) => {
    try {
        const targetDate = new Date(req.params.date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const dailyExpenses = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $lookup: { // Join with categories to get category name
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: '$categoryDetails' // Deconstruct the categoryDetails array
            },
            {
                $group: {
                    _id: {
                        categoryId: '$categoryDetails._id',
                        categoryName: '$categoryDetails.name',
                        categoryType: '$categoryDetails.type'
                    },
                    totalAmount: { $sum: '$amount' },
                    expenses: {
                        $push: { // Push individual expenses into an array
                            _id: '$_id',
                            description: '$description',
                            amount: '$amount',
                            date: '$date',
                            paymentMethod: '$paymentMethod',
                            isBusinessCreditPaid: '$isBusinessCreditPaid',
                            type: '$type'
                        }
                    }
                }
            },
            {
                $sort: { '_id.categoryType': 1, '_id.categoryName': 1 }
            },
            {
                $project: {
                    _id: 0, // Exclude default _id
                    categoryId: '$_id.categoryId',
                    categoryName: '$_id.categoryName',
                    categoryType: '$_id.categoryType',
                    totalAmount: 1,
                    expenses: 1
                }
            }
        ]);

        const totalDailySpend = dailyExpenses.reduce((acc, curr) => acc + curr.totalAmount, 0);

        res.status(200).json({ date: startOfDay, totalDailySpend, dailyExpenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching daily report', error: error.message });
    }
});

// @route GET /api/expenses/reports/summary
// @desc Get summary reports (e.g., monthly, category-wise)
// @access Private
router.get('/reports/summary', protect, async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query; // groupBy: 'category', 'month', 'type'

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required for summary reports' });
        }

        const query = {
            user: req.user._id,
            date: {
                $gte: new Date(startDate).setHours(0, 0, 0, 0),
                $lte: new Date(endDate).setHours(23, 59, 59, 999)
            }
        };

        let groupStage = {};
        let projectStage = { totalAmount: 1 };
        let sortStage = {};

        switch (groupBy) {
            case 'category':
                groupStage = {
                    _id: { categoryId: '$category', type: '$type' },
                    totalAmount: { $sum: '$amount' }
                };
                // Lookup category name
                projectStage = {
                    _id: 0,
                    categoryId: '$_id.categoryId',
                    categoryType: '$_id.type',
                    totalAmount: 1
                };
                sortStage = { totalAmount: -1 };
                break;
            case 'month':
                groupStage = {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    totalAmount: { $sum: '$amount' }
                };
                projectStage = {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    type: '$_id.type',
                    totalAmount: 1
                };
                sortStage = { year: 1, month: 1 };
                break;
            case 'type': // Personal vs Business
            default:
                groupStage = {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                };
                projectStage = { _id: 0, type: '$_id', totalAmount: 1 };
                sortStage = { type: 1 };
                break;
        }

        let pipeline = [
            { $match: query },
            { $group: groupStage }
        ];

        if (groupBy === 'category') {
            pipeline.push({
                $lookup: {
                    from: 'categories',
                    localField: '_id.categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            });
            pipeline.push({ $unwind: '$categoryInfo' });
            projectStage.categoryName = '$categoryInfo.name';
        }

        pipeline.push({ $project: projectStage });
        pipeline.push({ $sort: sortStage });

        const summary = await Expense.aggregate(pipeline);

        let totalOverallSpend = 0;
        if (summary.length > 0) {
            totalOverallSpend = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);
        }

        res.status(200).json({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalOverallSpend,
            report: summary
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating summary report', error: error.message });
    }
});


// @route PUT /api/expenses/business-credit/mark-paid
// @desc Mark multiple business credit expenses as paid
// @access Private
router.put('/business-credit/mark-paid', protect, async (req, res) => {
    const { expenseIds } = req.body; // Array of expense IDs to mark as paid

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
        return res.status(400).json({ message: 'An array of expenseIds is required.' });
    }

    try {
        const result = await Expense.updateMany(
            {
                _id: { $in: expenseIds },
                user: req.user.id,
                type: 'business',
                paymentMethod: 'Store Credit',
                isBusinessCreditPaid: false
            },
            { $set: { isBusinessCreditPaid: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No matching unpaid business credit expenses found for these IDs or user.' });
        }

        res.status(200).json({
            message: `${result.modifiedCount} business credit expenses marked as paid successfully.`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error marking business credit expenses as paid', error: error.message });
    }
});


module.exports = router;