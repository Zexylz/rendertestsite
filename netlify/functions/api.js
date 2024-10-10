const express = require('express');
const serverless = require('serverless-http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to generate invite codes
function generateInviteCode() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate invite code route
app.post('/api/generate-invite', async (req, res) => {
  try {
    const code = generateInviteCode();
    const [result] = await pool.query(
      'INSERT INTO invite_codes (code, role, uses_left) VALUES (?, "user", 1)',
      [code]
    );
    res.json({ code });
  } catch (error) {
    console.error('Error generating invite code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      
      if (match) {
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, inviteCode } = req.body;
    
    // Check if user already exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check invite code
    const [inviteCodes] = await pool.query('SELECT * FROM invite_codes WHERE code = ? AND uses_left > 0', [inviteCode]);
    if (inviteCodes.length === 0) {
      return res.status(400).json({ message: 'Invalid or exhausted invite code' });
    }

    const role = inviteCodes[0].role;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    // Decrease uses_left for the invite code
    await pool.query('UPDATE invite_codes SET uses_left = uses_left - 1 WHERE code = ?', [inviteCode]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add other routes as needed...

module.exports.handler = serverless(app);