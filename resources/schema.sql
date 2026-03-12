-- Run with: npm run db:init (local) or npm run db:init:remote (production)
DROP TABLE IF EXISTS waitlist;

CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(254) NOT NULL UNIQUE COLLATE NOCASE CHECK(length(email) <= 254),
  utm_source VARCHAR(64),
  created_at VARCHAR(20) NOT NULL DEFAULT (datetime('now'))
);
