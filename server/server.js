// server/server.js (or index.js)

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const businessCreditRoutes = require('./routes/businessCreditRoutes'); // Make sure this is imported

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors({
    origin: 'http://localhost:5173', // IMPORTANT: Match your frontend's exact URL
    credentials: true, // Allow cookies/authorization headers
}));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/business-credits', businessCreditRoutes); // Make sure this route is mounted

// Basic route for testing server
app.get('/', (req, res) => {
    res.send('Expense Tracker API is running!');
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});