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

// Add all your existing routes and middleware here
// ... (copy all routes and middleware from src/server.js)

// Remove the static file serving and catchall handler

// Remove the createTables and createInitialAdminInviteCode functions

// Remove the app.listen part at the end

// Instead, export the handler
module.exports.handler = serverless(app);