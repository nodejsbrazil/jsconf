-- Run with: npm run db:init (local) or npm run db:init:remote (production)
DROP TABLE IF EXISTS waitlist;

CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  utm_source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);