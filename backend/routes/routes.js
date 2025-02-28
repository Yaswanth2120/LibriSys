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

// ✅ Middleware to Restrict Access to Admins & Librarians
function verifyAdminLibrarian(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
        return res.status(403).json({ error: 'Forbidden: Only Admins or Librarians can perform this action' });
    }
    next();
}

// ✅ 1. Get All Books (Public)
router.get('/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 2. Get a Book by ID (Public)
router.get('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 3. Add a New Book (Admins & Librarians Only)
router.post('/books', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const { title, author, isbn } = req.body;
        const result = await pool.query(
            'INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3) RETURNING *',
            [title, author, isbn]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 4. Update a Book (Admins & Librarians Only)
router.put('/books/:id', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, available } = req.body;
        const result = await pool.query(
            'UPDATE books SET title = $1, author = $2, isbn = $3, available = $4 WHERE id = $5 RETURNING *',
            [title, author, isbn, available, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ 5. Delete a Book (Admins & Librarians Only)
router.delete('/books/:id', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Borrow a Book (Authenticated Users Only)
// ✅ Student Requests to Borrow a Book (Requires Admin Approval)
router.post('/borrow', verifyToken, async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.id;

        // Check if the book exists
        const bookCheck = await pool.query('SELECT available FROM books WHERE id = $1', [book_id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ error: 'Book not found' });

        // Create borrow request with status "pending"
        const borrowRequest = await pool.query(
            `INSERT INTO borrow_records (user_id, book_id, status) 
             VALUES ($1, $2, 'pending') RETURNING *`,
            [user_id, book_id]
        );

        res.status(201).json({ message: 'Borrow request submitted. Waiting for approval.', request: borrowRequest.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// ✅ Admin Approves or Rejects Borrow Request
router.put('/borrow/approve/:id', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // "approve" or "reject"

        // Check if borrow request exists
        const requestCheck = await pool.query('SELECT * FROM borrow_records WHERE id = $1', [id]);
        if (requestCheck.rows.length === 0) return res.status(404).json({ error: 'Borrow request not found' });

        const book_id = requestCheck.rows[0].book_id;

        if (action === 'approve') {
            // Mark request as approved and set book as unavailable
            await pool.query('UPDATE borrow_records SET status = $1 WHERE id = $2', ['approved', id]);
            await pool.query('UPDATE books SET available = false WHERE id = $1', [book_id]);

            res.json({ message: 'Borrow request approved. Book is now borrowed.' });
        } else if (action === 'reject') {
            // Delete the borrow request if rejected
            await pool.query('DELETE FROM borrow_records WHERE id = $1', [id]);

            res.json({ message: 'Borrow request rejected.' });
        } else {
            res.status(400).json({ error: 'Invalid action. Use "approve" or "reject".' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Get All Pending Borrow Requests (Admins & Librarians Only)
router.get('/borrow/pending-requests', verifyToken, verifyAdminLibrarian, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT borrow_records.id, users.name AS student_name, books.title AS book_title, borrow_records.status
            FROM borrow_records
            JOIN users ON borrow_records.user_id = users.id
            JOIN books ON borrow_records.book_id = books.id
            WHERE borrow_records.status = 'pending'
            ORDER BY borrow_records.id ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// ✅ Return a Book (Authenticated Users Only)
router.put('/return/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { return_date, fine } = req.body;

        // Check if borrow record exists
        const borrowCheck = await pool.query('SELECT * FROM borrow_records WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (borrowCheck.rows.length === 0) return res.status(404).json({ error: 'Borrow record not found for this user' });

        const book_id = borrowCheck.rows[0].book_id;

        // Update borrow record
        await pool.query(
            'UPDATE borrow_records SET return_date = $1, fine = $2 WHERE id = $3 RETURNING *',
            [return_date, fine, id]
        );

        // Mark book as available
        await pool.query('UPDATE books SET available = true WHERE id = $1', [book_id]);

        res.json({ message: 'Book returned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
