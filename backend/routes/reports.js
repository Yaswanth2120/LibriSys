const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// ✅ Middleware to Verify JWT Token
function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

// ✅ Middleware to Allow Only Admins & Librarians
function verifyAdminLibrarian(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
        return res.status(403).json({ error: 'Forbidden: Only Admins or Librarians can access reports' });
    }
    next();
}

// ✅ 1. Most Borrowed Books 📚
router.get('/most-borrowed', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT books.id, books.title, books.author, COUNT(borrow_records.id) AS borrow_count
            FROM borrow_records
            JOIN books ON borrow_records.book_id = books.id
            GROUP BY books.id
            ORDER BY borrow_count DESC
            LIMIT 5;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 2. Top Active Borrowers 👥
router.get('/top-borrowers', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT users.id, users.name, users.email, COUNT(borrow_records.id) AS books_borrowed
            FROM borrow_records
            JOIN users ON borrow_records.user_id = users.id
            GROUP BY users.id
            ORDER BY books_borrowed DESC
            LIMIT 5;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// ✅ 3. Overdue Books & Dynamic Fine Calculation 💰
router.get('/overdue-books', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT users.id, users.name, books.title, borrow_records.borrow_date, 
                   borrow_records.return_date,
                   GREATEST(0, EXTRACT(DAY FROM (NOW() - borrow_records.borrow_date)) - 14) * 1 AS fine
            FROM borrow_records
            JOIN users ON borrow_records.user_id = users.id
            JOIN books ON borrow_records.book_id = books.id
            WHERE borrow_records.return_date IS NULL
            ORDER BY borrow_records.borrow_date ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 4. Mark Fine as Paid (Admins & Librarians Only)
router.post('/pay-fine/:borrow_id', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const { borrow_id } = req.params;
        const { amount } = req.body;

        // Check if the borrow record exists
        const borrowCheck = await pool.query('SELECT * FROM borrow_records WHERE id = $1', [borrow_id]);
        if (borrowCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Borrow record not found' });
        }

        // Check if fine exists
        const fineAmount = borrowCheck.rows[0].fine;
        if (fineAmount === 0) {
            return res.status(400).json({ error: 'No fine to pay' });
        }

        // Ensure amount paid is correct
        if (amount < fineAmount) {
            return res.status(400).json({ error: 'Insufficient payment, full fine must be paid' });
        }

        // Insert payment record
        await pool.query(
            'INSERT INTO payments (user_id, borrow_id, amount_paid) VALUES ($1, $2, $3)',
            [borrowCheck.rows[0].user_id, borrow_id, amount]
        );

        // Set fine to 0 after payment
        await pool.query('UPDATE borrow_records SET fine = 0 WHERE id = $1', [borrow_id]);

        res.json({ message: 'Fine paid successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 5. View All Fine Payments (Admins & Librarians Only)
router.get('/payment-history', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT payments.id, users.name AS user_name, books.title AS book_title, 
                   payments.amount_paid, payments.paid_on
            FROM payments
            JOIN users ON payments.user_id = users.id
            JOIN borrow_records ON payments.borrow_id = borrow_records.id
            JOIN books ON borrow_records.book_id = books.id
            ORDER BY payments.paid_on DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 6. Student Dashboard - View Borrowed Books & Fines
router.get('/student-dashboard', verifyToken, async (req, res) => {
    try {
        // Fetch books borrowed by the student
        const borrowedBooks = await pool.query(`
            SELECT books.id, books.title, books.author, borrow_records.borrow_date, borrow_records.return_date, borrow_records.fine
            FROM borrow_records
            JOIN books ON borrow_records.book_id = books.id
            WHERE borrow_records.user_id = $1
            ORDER BY borrow_records.borrow_date DESC;
        `, [req.user.id]);

        // Fetch total fine balance
        const fineBalance = await pool.query(`
            SELECT SUM(fine) AS total_fine FROM borrow_records WHERE user_id = $1;
        `, [req.user.id]);

        // Fetch payment history
        const paymentHistory = await pool.query(`
            SELECT books.title, payments.amount_paid, payments.paid_on
            FROM payments
            JOIN borrow_records ON payments.borrow_id = borrow_records.id
            JOIN books ON borrow_records.book_id = books.id
            WHERE payments.user_id = $1
            ORDER BY payments.paid_on DESC;
        `, [req.user.id]);

        res.json({
            borrowed_books: borrowedBooks.rows,
            total_fine: fineBalance.rows[0].total_fine || 0,
            payment_history: paymentHistory.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
