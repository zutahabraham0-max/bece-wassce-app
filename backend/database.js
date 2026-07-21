const Database = require('better-sqlite3');
const db = new Database('app.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level TEXT NOT NULL -- 'JHS' or 'SHS'
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    year INTEGER,
    exam_type TEXT, -- 'BECE' or 'WASSCE'
    question_text TEXT NOT NULL,
    answer_text TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    program TEXT,
    career_title TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );
`);

console.log('Database and tables created successfully!');

module.exports = db;