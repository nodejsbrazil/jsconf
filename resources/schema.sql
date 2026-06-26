-- Run with: npm run db:init (local) or npm run db:init:remote (production)

CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(254) NOT NULL UNIQUE COLLATE NOCASE CHECK(length(email) <= 254),
  ip VARCHAR(64),
  utm_source VARCHAR(64),
  created_at VARCHAR(20) NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_ip_hash ON waitlist(ip);

CREATE TABLE IF NOT EXISTS speakers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           VARCHAR(200)  NOT NULL CHECK(length(name) >= 1),
  email          VARCHAR(254)  NOT NULL UNIQUE COLLATE NOCASE CHECK(length(email) <= 254),
  phone          VARCHAR(20)   NOT NULL CHECK(length(phone) >= 8),
  city           VARCHAR(100)  NOT NULL CHECK(length(city) >= 1),
  state          VARCHAR(2)    NOT NULL CHECK(length(state) = 2),
  travel_pref    INTEGER       NOT NULL CHECK(travel_pref BETWEEN 0 AND 1),
  linkedin       VARCHAR(200)  NOT NULL DEFAULT '',
  instagram      VARCHAR(200)  NOT NULL DEFAULT '',
  youtube        VARCHAR(200)  NOT NULL DEFAULT '',
  github         VARCHAR(200)  NOT NULL DEFAULT '',
  website        VARCHAR(200)  NOT NULL DEFAULT '',
  experience     INTEGER       NOT NULL CHECK(experience BETWEEN 0 AND 3),
  bio            VARCHAR(280)  NOT NULL CHECK(length(bio) >= 1 AND length(bio) <= 280),
  ip             VARCHAR(64),
  created_at     VARCHAR(20)   NOT NULL DEFAULT (datetime('now')),
  updated_at     VARCHAR(20)   NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_speakers_email ON speakers(email);

CREATE TABLE IF NOT EXISTS talks (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  speaker_id     INTEGER       NOT NULL REFERENCES speakers(id),
  duration       INTEGER       NOT NULL CHECK(duration BETWEEN 0 AND 1),
  title          VARCHAR(500)  NOT NULL CHECK(length(title) >= 1),
  description    TEXT          NOT NULL CHECK(length(description) >= 1),
  audience_level INTEGER       NOT NULL CHECK(audience_level BETWEEN 0 AND 3),
  reason         TEXT          NOT NULL CHECK(length(reason) >= 1),
  status         INTEGER       NOT NULL DEFAULT 0 CHECK(status BETWEEN 0 AND 4),
  created_at     VARCHAR(20)   NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_talks_speaker_id ON talks(speaker_id);
CREATE INDEX IF NOT EXISTS idx_talks_status ON talks(status);

CREATE TABLE IF NOT EXISTS speaker_diversity (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  speaker_id     INTEGER       NOT NULL UNIQUE REFERENCES speakers(id),
  gender         INTEGER       NOT NULL DEFAULT 3 CHECK(gender BETWEEN 0 AND 3),
  race           INTEGER       NOT NULL DEFAULT 6 CHECK(race BETWEEN 0 AND 6),
  disability     INTEGER       NOT NULL DEFAULT 5 CHECK(disability BETWEEN 0 AND 5),
  consented_at   VARCHAR(20)   NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_speaker_diversity_speaker_id ON speaker_diversity(speaker_id);

CREATE TABLE IF NOT EXISTS ticket_tiers (
  name   VARCHAR(200) PRIMARY KEY,  -- guild.host tier name, matched against attendee tier
  budget INTEGER      NOT NULL CHECK(budget >= 0)
);

CREATE TABLE IF NOT EXISTS c4p_votes (
  id         INTEGER     PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT        NOT NULL,  -- guild.host user id (from OAuth)
  talk_id    INTEGER     NOT NULL REFERENCES talks(id),
  created_at VARCHAR(20) NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, talk_id)
);

CREATE INDEX IF NOT EXISTS idx_c4p_votes_user ON c4p_votes(user_id);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  name          TEXT    PRIMARY KEY,  -- 'organizer'
  access_token  TEXT    NOT NULL,
  refresh_token TEXT    NOT NULL,
  expires_at    INTEGER NOT NULL      -- unix seconds
);
