const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());

// Try to use cors if available, otherwise continue without it
try {
  const cors = require('cors');
  app.use(cors());
} catch (error) {
  console.warn("CORS is not installed. The server will run without CORS support.");
}

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

// Add this function to generate invite codes
function generateInviteCode() {
  return crypto.randomBytes(16).toString('hex');
}

// Function to create initial admin invite code
async function createInitialAdminInviteCode() {
  try {
    const [existingCodes] = await pool.query('SELECT * FROM invite_codes WHERE role = "admin"');
    if (existingCodes.length === 0) {
      const code = generateInviteCode();
      await pool.query(
        'INSERT INTO invite_codes (code, role, uses_left) VALUES (?, "admin", 1)',
        [code]
      );
      console.log('Initial admin invite code created:', code);
    }
  } catch (error) {
    console.error('Error creating initial admin invite code:', error);
  }
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

// Route to generate invite codes (protected, admin only)
app.post('/api/generate-invite', verifyToken, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    const { role, uses } = req.body;
    const code = crypto.randomBytes(16).toString('hex');
    const [result] = await pool.query(
      'INSERT INTO invite_codes (code, role, uses_left) VALUES (?, ?, ?)',
      [code, role, uses]
    );
    res.json({ code, role, uses });
  } catch (error) {
    console.error('Error generating invite code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get all invite codes (protected, admin only)
app.get('/api/invite-codes', verifyToken, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    const [inviteCodes] = await pool.query('SELECT * FROM invite_codes');
    res.json(inviteCodes);
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User registration
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

// User login, forgot password, and reset password
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

// Admin dashboard
app.post('/api/admin-dashboard', async (req, res) => {
  const { action, machineId, groupId, entryId, name, filterable } = req.body;

  try {
    switch (action) {
      case 'getMachines':
        const [machines] = await pool.query('SELECT * FROM machines');
        res.json(machines);
        break;

      case 'createMachine':
        const [newMachine] = await pool.query('INSERT INTO machines (name) VALUES (?)', [name]);
        res.json({ id: newMachine.insertId, name });
        break;

      case 'updateMachine':
        await pool.query('UPDATE machines SET name = ? WHERE id = ?', [name, machineId]);
        res.json({ id: machineId, name });
        break;

      case 'deleteMachine':
        await pool.query('DELETE FROM machines WHERE id = ?', [machineId]);
        res.json({ message: 'Machine deleted successfully' });
        break;

      case 'getGroups':
        const [groups] = await pool.query('SELECT * FROM groups WHERE machine_id = ?', [machineId]);
        res.json(groups);
        break;

      case 'createGroup':
        const [newGroup] = await pool.query('INSERT INTO groups (machine_id, name) VALUES (?, ?)', [machineId, name]);
        res.json({ id: newGroup.insertId, name, machine_id: machineId });
        break;

      case 'updateGroup':
        await pool.query('UPDATE groups SET name = ? WHERE id = ?', [name, groupId]);
        res.json({ id: groupId, name });
        break;

      case 'deleteGroup':
        await pool.query('DELETE FROM groups WHERE id = ?', [groupId]);
        res.json({ message: 'Group deleted successfully' });
        break;

      case 'getEntries':
        const [entries] = await pool.query('SELECT * FROM entries WHERE group_id = ?', [groupId]);
        res.json(entries);
        break;

      case 'createEntry':
        const [newEntry] = await pool.query('INSERT INTO entries (group_id, name, filterable) VALUES (?, ?, ?)', [groupId, name, filterable]);
        res.json({ id: newEntry.insertId, name, group_id: groupId, filterable });
        break;

      case 'updateEntry':
        await pool.query('UPDATE entries SET name = ?, filterable = ? WHERE id = ?', [name, filterable, entryId]);
        res.json({ id: entryId, name, filterable });
        break;

      case 'deleteEntry':
        await pool.query('DELETE FROM entries WHERE id = ?', [entryId]);
        res.json({ message: 'Entry deleted successfully' });
        break;

      case 'toggleFilterable':
        const [entry] = await pool.query('SELECT filterable FROM entries WHERE id = ?', [entryId]);
        const newFilterableState = !entry[0].filterable;
        await pool.query('UPDATE entries SET filterable = ? WHERE id = ?', [newFilterableState, entryId]);
        res.json({ id: entryId, filterable: newFilterableState });
        break;

      default:
        res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in admin dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User dashboard
app.post('/api/user-dashboard', async (req, res) => {
  const { action, machineId, formula, formulaId, entryId, value } = req.body;

  try {
    switch (action) {
      case 'getMachines':
        console.log('Fetching machines for user dashboard');
        const [machines] = await pool.query('SELECT * FROM machines');
        console.log('Fetched machines:', machines);
        
        // Fetch groups and entries for each machine
        for (let machine of machines) {
          const [groups] = await pool.query('SELECT * FROM groups WHERE machine_id = ?', [machine.id]);
          for (let group of groups) {
            const [entries] = await pool.query('SELECT * FROM entries WHERE group_id = ?', [group.id]);
            group.entries = entries;
          }
          machine.groups = groups;
        }
        
        console.log('Sending machines with groups and entries:', machines);
        res.json(machines);
        break;

      case 'createFormula':
        const [newFormula] = await pool.query(
          'INSERT INTO formulas (machine_id, job_name) VALUES (?, ?)',
          [machineId, formula.jobName]
        );
        const formulaId = newFormula.insertId;

        for (const entry of formula.entries) {
          await pool.query(
            'INSERT INTO formula_entries (formula_id, entry_id, value) VALUES (?, ?, ?)',
            [formulaId, entry.id, entry.value]
          );
        }

        const [createdFormula] = await pool.query(
          'SELECT * FROM formulas WHERE id = ?',
          [formulaId]
        );
        const [formulaEntries] = await pool.query(
          'SELECT * FROM formula_entries WHERE formula_id = ?',
          [formulaId]
        );
        createdFormula[0].entries = formulaEntries;

        res.json(createdFormula[0]);
        break;

      case 'updateEntryValue':
        await pool.query(
          'UPDATE formula_entries SET value = ? WHERE formula_id = ? AND entry_id = ?',
          [value, formulaId, entryId]
        );
        res.json({ message: 'Entry value updated successfully' });
        break;

      default:
        console.log('Invalid action:', action);
        res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in user dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route for fetching machines
app.get('/api/test-machines', async (req, res) => {
  try {
    const [machines] = await pool.query('SELECT * FROM machines');
    res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Function to create necessary tables
async function createTables() {
  try {
    // Create machines table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS machines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Create groups table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        machine_id INT,
        name VARCHAR(255) NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
      )
    `);

    // Create entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT,
        name VARCHAR(255) NOT NULL,
        filterable BOOLEAN DEFAULT false,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      )
    `);

    // Create formulas table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS formulas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        machine_id INT,
        job_name VARCHAR(255) NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
      )
    `);

    // Create formula_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS formula_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        formula_id INT,
        entry_id INT,
        value VARCHAR(255),
        FOREIGN KEY (formula_id) REFERENCES formulas(id) ON DELETE CASCADE,
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Update the static file serving
app.use(express.static(path.join(__dirname, '../build')));

// Update the catchall handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await createTables(); // Add this line
  await createInitialAdminInviteCode();
});