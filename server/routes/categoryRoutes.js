const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/categories
// @desc Add a new category
// @access Private
router.post('/', protect, async (req, res) => {
    const { name, type } = req.body;
    try {
        const newCategory = new Category({ name, type, user: req.user.id });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Duplicate key error (for unique index)
            return res.status(400).json({ message: 'Category with this name and type already exists for this user.' });
        }
        res.status(500).json({ message: 'Server error adding category' });
    }
});

// @route GET /api/categories
// @desc Get all categories for the logged-in user
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// You can add routes for updating or deleting categories if needed
// For example:
// @route DELETE /api/categories/:id
// @desc Delete a category
// @access Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!category) {
            return res.status(404).json({ message: 'Category not found or not authorized' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting category' });
    }
});


module.exports = router;