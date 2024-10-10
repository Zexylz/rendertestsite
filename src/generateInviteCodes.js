const crypto = require('crypto');
const mysql = require('mysql2/promise');
require('dotenv').config();

function generateSecureCode(length = 8) {
  return crypto.randomBytes(length).toString('hex');
}

async function generateAndSaveInviteCodes(adminUses = 1, userUses = 5) {
  const adminCode = generateSecureCode();
  const userCode = generateSecureCode();

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    await pool.query(
      'INSERT INTO invite_codes (code, role, uses_left) VALUES (?, ?, ?), (?, ?, ?)',
      [adminCode, 'admin', adminUses, userCode, 'user', userUses]
    );

    console.log('Admin Invite Code:', adminCode, '(Uses left:', adminUses, ')');
    console.log('User Invite Code:', userCode, '(Uses left:', userUses, ')');
    console.log('Invite codes have been saved to the database.');
  } catch (error) {
    console.error('Error saving invite codes:', error);
  } finally {
    await pool.end();
  }
}

generateAndSaveInviteCodes();