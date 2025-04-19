-- This file creates the schema for the database
-- Create tables
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    notifications_preferences JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS sports (
    sport_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    min_players INT NOT NULL,
    max_players INT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_levels (
    skill_level_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_sports (
    user_sport_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    sport_id INT REFERENCES sports(sport_id) ON DELETE CASCADE,
    skill_level_id INT REFERENCES skill_levels(skill_level_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS availability (
    availability_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS matches (
    match_id SERIAL PRIMARY KEY,
    sport_id INT REFERENCES sports(sport_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending_confirmation',
    required_skill_level INT REFERENCES skill_levels(skill_level_id) ON DELETE SET NULL,
    min_players INT NOT NULL,
    confirmed_players INT DEFAULT 0,
    confirmation_deadline TIMESTAMP NOT NULL,
    auto_cancel BOOLEAN DEFAULT TRUE,
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS match_players (
    match_player_id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(match_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'invited',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    reminder_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS player_responses (
    response_id SERIAL PRIMARY KEY,
    match_player_id INT REFERENCES match_players(match_player_id) ON DELETE CASCADE,
    response_type VARCHAR(20) NOT NULL,
    comment TEXT,
    response_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    match_id INT REFERENCES matches(match_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    delivery_status VARCHAR(20) DEFAULT 'pending',
    channel VARCHAR(20) DEFAULT 'email'
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sports_sport_id ON user_sports(sport_id);
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_times ON availability(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user_id ON match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
