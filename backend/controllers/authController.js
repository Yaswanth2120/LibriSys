const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ 1. User Signup (Students Only)
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database (Role = 'student' by default)
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'student']
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 2. User Login
exports.login = async (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;
        console.log("🟡 Login request received for email:", email);

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            console.log("❌ No user found with this email");
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        console.log("✅ User found:", user);

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log("❌ Incorrect password");
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // ✅ Enforce role-based login restriction
        if (expectedRole && user.role !== expectedRole) {
            console.log(`❌ Unauthorized login attempt. Expected role: ${expectedRole}, Found: ${user.role}`);
            return res.status(403).json({ error: `Unauthorized login. Expected role: ${expectedRole}, but found: ${user.role}` });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("✅ Token generated successfully");

        res.json({ message: 'Login successful', token, role: user.role });
    } catch (err) {
        console.error("❌ Server error:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// ✅ 3. Get User Profile (Protected Route)
exports.getProfile = async (req, res) => {
    try {
        const user = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};