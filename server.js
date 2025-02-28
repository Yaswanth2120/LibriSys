// LibriSys - Backend with Raw SQL Queries
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Test Database Connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.stack);
    } else {
        console.log('📦 Database Connected Successfully');
    }
    release();
});

// Import routes
const bookRoutes = require('./routes/routes');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');

//Use Routes
app.use('/api', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send('📚 Welcome to LibriSys API');
});

// ✅ Background Job: Auto-Update Fines Every Midnight
const updateFines = async () => {
    try {
        await pool.query(`
            UPDATE borrow_records
            SET fine = GREATEST(0, EXTRACT(DAY FROM (NOW() - borrow_date)) - 14) * 1
            WHERE return_date IS NULL;
        `);
        console.log("💰 Overdue fines updated successfully!");
    } catch (err) {
        console.error("❌ Error updating fines:", err.message);
    }
};

// Run every midnight
setInterval(updateFines, 24 * 60 * 60 * 1000); // Runs every 24 hours


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
