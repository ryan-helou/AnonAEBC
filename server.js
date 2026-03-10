// ============================================================
// AnonAEBC - Anonymous Question Submission Server
// Main Express server for local development and production
// ============================================================

const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Admin Password (change this before deploying!) -----
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aebc2024';

// ----- Database Setup -----
// Store the database in the data/ directory
const dbPath = path.join(__dirname, 'data', 'questions.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Create the questions table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ----- Middleware -----
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----- Rate Limiting -----
// Users can submit max 1 question every 10 seconds
const submitLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 1,
  message: { error: 'Please wait 10 seconds before submitting another question.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ----- API Routes -----

// POST /api/questions - Submit a new anonymous question
app.post('/api/questions', submitLimiter, (req, res) => {
  const { question_text } = req.body;

  // Validate: question must exist
  if (!question_text || typeof question_text !== 'string') {
    return res.status(400).json({ error: 'Question text is required.' });
  }

  // Validate: trim and check length
  const trimmed = question_text.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'Question cannot be empty.' });
  }
  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'Question must be 500 characters or less.' });
  }

  // Insert into database (no IP or user data stored)
  const stmt = db.prepare('INSERT INTO questions (question_text) VALUES (?)');
  stmt.run(trimmed);

  res.status(201).json({ success: true, message: 'Question submitted successfully.' });
});

// POST /api/admin/login - Verify admin password
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Incorrect password.' });
  }
});

// GET /api/admin/questions - Fetch all questions (admin only)
app.get('/api/admin/questions', (req, res) => {
  const password = req.headers['x-admin-password'];

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  // Return questions in reverse chronological order (newest first)
  const questions = db.prepare('SELECT * FROM questions ORDER BY timestamp DESC').all();
  res.json({ questions });
});

// DELETE /api/admin/questions/:id - Delete a question (admin only)
app.delete('/api/admin/questions/:id', (req, res) => {
  const password = req.headers['x-admin-password'];

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const result = db.prepare('DELETE FROM questions WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  res.json({ success: true, message: 'Question deleted.' });
});

// ----- Serve Frontend -----
// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all: serve the homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`AnonAEBC server running at http://localhost:${PORT}`);
});

module.exports = app;
