const pool = require('../config/db');

// ✅ 1. Student Requests to Borrow a Book (Requires Admin Approval)
exports.requestBorrow = async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.id;

        // Check if the book exists and is available
        const bookCheck = await pool.query('SELECT available FROM books WHERE id = $1', [book_id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        if (!bookCheck.rows[0].available) return res.status(400).json({ error: 'Book is already borrowed' });

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
};

// ✅ 2. Admin Approves or Rejects Borrow Request
exports.approveBorrow = async (req, res) => {
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
};

// ✅ 3. Get All Pending Borrow Requests (Admins & Librarians Only)
exports.getPendingRequests = async (req, res) => {
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
};

// ✅ 4. Student Returns a Book
exports.returnBook = async (req, res) => {
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
};
