-- Roxiler Store Rating Platform — PostgreSQL schema
-- Database: roxiler_rating
-- Run this file once against an empty database (e.g. via pgAdmin Query Tool).

-- ---------------------------------------------------------------------------
-- Role enum
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'STORE_OWNER');
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address       VARCHAR(400) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_name    ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_email   ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_address ON users (address);
CREATE INDEX IF NOT EXISTS idx_users_role    ON users (role);

-- ---------------------------------------------------------------------------
-- stores
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  address    VARCHAR(400) NOT NULL,
  owner_id   INTEGER      NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT stores_email_unique UNIQUE (email),
  CONSTRAINT stores_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stores_name     ON stores (name);
CREATE INDEX IF NOT EXISTS idx_stores_email    ON stores (email);
CREATE INDEX IF NOT EXISTS idx_stores_address  ON stores (address);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores (owner_id);

-- ---------------------------------------------------------------------------
-- ratings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL,
  store_id   INTEGER     NOT NULL,
  rating     INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ratings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT ratings_store_id_fkey
    FOREIGN KEY (store_id) REFERENCES stores (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT ratings_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT ratings_user_store_unique UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_user_id  ON ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings (store_id);
