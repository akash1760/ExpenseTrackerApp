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
    origin: [
        'http://localhost:5173',
        'https://expensetrackerbyakash.netlify.app',
        'http://172.20.10.4:5173' // ✅ Added your LAN IP for mobile access
    ],
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
app.use('/api/business-credits', businessCreditRoutes);

// Basic route for testing server
app.get('/', (req, res) => {
    res.send('Expense Tracker API is running!');
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// ✅ Listen on 0.0.0.0 so LAN devices (like your mobile) can connect
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});
