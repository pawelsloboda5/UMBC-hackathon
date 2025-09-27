-- Enable extensions on first init
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Simple sanity table
CREATE TABLE IF NOT EXISTS ping (
  id  SERIAL PRIMARY KEY,
  msg TEXT NOT NULL DEFAULT 'pong'
);
