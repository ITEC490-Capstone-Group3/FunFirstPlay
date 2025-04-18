-- Sample Data for testing functionality of the frontend/backend against the database

-- Create test sports
INSERT INTO sports (name, description, min_players, max_players) VALUES
('Soccer', 'A sport played with a round ball between two teams of eleven players.', 6, 22),
('Basketball', 'A sport played with a racket and a ball between two teams of five players.', 2, 10),
('Tennis', 'A sport played with a racket and a ball between two players or two pairs of players.', 1, 4),
('Volleyball', 'A sport played with a ball between two teams of six players.', 2, 12),
('Table Tennis', 'A sport played with a racket and a ball on a table between two players or two pairs of players.', 1, 4),
('Golf', 'A sport played with a club and a ball on a course.', 2, 8),
('Running', 'A sport played on foot.', 1, 20),
('Cycling', 'A sport played on a bicycle.', 1, 20);

-- Create test skill levels
INSERT INTO skill_levels (name, description) VALUES
('Fun Only', 'A person who is looking to have fun and does not care about skill level.'),
('Beginner', 'A person who is new to or inexperienced in a skill or activity.'),
('Intermediate', 'A person who has some degree of skill or experience in a skill or activity.'),
('Advanced', 'A person who has a high degree of skill or experience in a skill or activity.');

-- Create test users
INSERT INTO users (email, username, password_hash, first_name, last_name, phone, timezone, preferences, notifications_preferences) VALUES
('user1@example.com', 'johndoe', 'hashed_password', 'John', 'Doe', '555-1234', 'America/Chicago', 
 '{"max_distance": 10, "preferred_locations": ["Olathe", "Overland Park"]}',
 '{"email": true, "sms": true, "reminder_hours": [24, 2]}'
),
('user2@example.com', 'jane_smith', 'hashed_password', 'Jane', 'Smith', '555-5678', 'America/Chicago', 
 '{"max_distance": 15, "preferred_locations": ["Leawood", "Kansas City"]}',
 '{"email": true, "sms": false, "reminder_hours": [12]}'
),
('user3@example.com', 'mjohnson', 'hashed_password', 'Michael', 'Johnson', '555-9012', 'America/Chicago', 
 '{"max_distance": 8, "preferred_locations": ["Olathe", "Kansas City"]}',
 '{"email": true, "sms": true, "reminder_hours": [48, 24, 4]}'
),
('user4@example.com', 'swilliams', 'hashed_password', 'Sarah', 'Williams', '555-3456', 'America/Chicago', 
 '{"max_distance": 12, "preferred_locations": ["Leawood", "Overland Park"]}',
 '{"email": true, "sms": false, "reminder_hours": [24]}'
),
('user5@example.com', 'bmartin', 'hashed_password', 'Brian', 'Martin', '555-6789', 'America/Chicago', 
 '{"max_distance": 20, "preferred_locations": ["Olathe", "Leawood"]}',
 '{"email": true, "sms": true, "reminder_hours": [24, 1]}'
),
('user6@example.com', 'lwilson', 'hashed_password', 'Laura', 'Wilson', '555-2345', 'America/Chicago', 
 '{"max_distance": 5, "preferred_locations": ["Kansas City", "Overland Park"]}',
 '{"email": true, "sms": false, "reminder_hours": [48, 12]}'
),
('user7@example.com', 'dlee', 'hashed_password', 'David', 'Lee', '555-7890', 'America/Chicago', 
 '{"max_distance": 15, "preferred_locations": ["Olathe", "Leawood"]}',
 '{"email": true, "sms": true, "reminder_hours": [24, 6]}'
),
('user8@example.com', 'kclark', 'hashed_password', 'Karen', 'Clark', '555-3456', 'America/Chicago', 
 '{"max_distance": 10, "preferred_locations": ["Kansas City", "Overland Park"]}',
 '{"email": true, "sms": false, "reminder_hours": [24, 2]}'
),
('user9@example.com', 'rrodriguez', 'hashed_password', 'Robert', 'Rodriguez', '555-9012', 'America/Chicago', 
 '{"max_distance": 8, "preferred_locations": ["Olathe", "Kansas City"]}',
 '{"email": true, "sms": true, "reminder_hours": [48, 24, 4]}'
),
('user10@example.com', 'jyoung', 'hashed_password', 'Jessica', 'Young', '555-5678', 'America/Chicago', 
 '{"max_distance": 12, "preferred_locations": ["Leawood", "Overland Park"]}',
 '{"email": true, "sms": false, "reminder_hours": [24]}'
),
('user11@example.com', 'mking', 'hashed_password', 'Matthew', 'King', '555-1234', 'America/Chicago', 
 '{"max_distance": 10, "preferred_locations": ["Olathe", "Overland Park"]}',
 '{"email": true, "sms": true, "reminder_hours": [24, 2]}'
),
('user12@example.com', 'jwhite', 'hashed_password', 'Jennifer', 'White', '555-5678', 'America/Chicago', 
 '{"max_distance": 15, "preferred_locations": ["Leawood", "Kansas City"]}',
 '{"email": true, "sms": false, "reminder_hours": [12]}'
),
('user13@example.com', 'hthomas', 'hashed_password', 'Henry', 'Thomas', '555-9012', 'America/Chicago', 
 '{"max_distance": 8, "preferred_locations": ["Olathe", "Kansas City"]}',
 '{"email": true, "sms": true, "reminder_hours": [48, 24, 4]}'
),
('user14@example.com', 'swalker', 'hashed_password', 'Susan', 'Walker', '555-3456', 'America/Chicago', 
 '{"max_distance": 12, "preferred_locations": ["Leawood", "Overland Park"]}',
 '{"email": true, "sms": false, "reminder_hours": [24]}'
);

-- Create test user sports preferences
INSERT INTO user_sports (user_id, sport_id, skill_level_id) VALUES
(1, 1, 4),
(1, 2, 3),
(1, 3, 2),
(1, 4, 1),
(2, 5, 3),
(2, 6, 2),
(2, 7, 1),
(2, 8, 4),
(3, 1, 2),
(3, 2, 1),
(3, 3, 4),
(3, 4, 3),
(4, 5, 1),
(4, 6, 4),
(4, 7, 3),
(4, 8, 2),
(5, 1, 4),
(5, 2, 3),
(5, 3, 2),
(5, 4, 1),
(6, 5, 3),
(6, 6, 2),
(6, 7, 1),
(6, 8, 4),
(7, 1, 2),
(7, 2, 1),
(7, 3, 4),
(7, 4, 3),
(8, 5, 1),
(8, 6, 4),
(8, 7, 3),
(8, 8, 2),
(9, 1, 4),
(9, 2, 3),
(9, 3, 2),
(9, 4, 1),
(10, 5, 3),
(10, 6, 2),
(10, 7, 1),
(10, 8, 4),
(11, 1, 2),
(11, 2, 1),
(11, 3, 4),
(11, 4, 3),
(12, 5, 1),
(12, 6, 4),
(12, 7, 3),
(12, 8, 2),
(13, 1, 4),
(13, 2, 3),
(13, 3, 2),
(13, 4, 1),
(14, 5, 3),
(14, 6, 2),
(14, 7, 1),
(14, 8, 4);

-- Create test user availability
INSERT INTO availability (user_id, start_time, end_time, is_recurring, recurrence_rule, status) VALUES
(1, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(2, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(3, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(4, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(5, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(6, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(7, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(8, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(9, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(10, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(11, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(12, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(13, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(14, '2023-10-01 09:00:00', '2023-10-01 11:00:00', true, 'FREQ=WEEKLY;BYDAY=MO', 'active'),
(1, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(2, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(3, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(4, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(5, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(6, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(7, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(8, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(9, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(10, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(11, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(12, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(13, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active'),
(14, '2023-10-02 14:00:00', '2023-10-02 16:00:00', true, 'FREQ=WEEKLY;BYDAY=TU', 'active');

-- Create test matches
INSERT INTO matches (sport_id, required_skill_level, start_time, end_time, location, status, min_players, confirmation_deadline) VALUES
(1, 4, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Olathe', 'pending_confirmation', 6, '2023-09-30 20:00:00'),
(2, 3, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Overland Park', 'pending_confirmation', 2, '2023-09-30 20:00:00'),
(3, 2, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Kansas City', 'pending_confirmation', 1, '2023-09-30 20:00:00'),
(4, 1, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Leawood', 'pending_confirmation', 2, '2023-09-30 20:00:00'),
(5, 4, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Olathe', 'pending_confirmation', 1, '2023-09-30 20:00:00'),
(6, 3, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Overland Park', 'pending_confirmation', 2, '2023-09-30 20:00:00'),
(7, 2, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Kansas City', 'pending_confirmation', 1, '2023-09-30 20:00:00'),
(8, 1, '2023-10-01 09:00:00', '2023-10-01 11:00:00', 'Leawood', 'pending_confirmation', 2, '2023-09-30 20:00:00'),
(1, 4, '2023-10-02 14:00:00', '2023-10-02 16:00:00', 'Olathe', 'pending_confirmation', 6, '2023-10-01 20:00:00'),
(2, 3, '2023-10-02 14:00:00', '2023-10-02 16:00:00', 'Overland Park', 'pending_confirmation', 2, '2023-10-01 20:00:00'),
(3, 2, '2023-10-02 14:00:00', '2023-10-02 16:00:00', 'Kansas City', 'pending_confirmation', 1, '2023-10-01 20:00:00');

-- Create test match players
INSERT INTO match_players (match_id, user_id, status) VALUES
(1, 1, 'accepted'),
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(1, 4, 'accepted'),
(2, 5, 'accepted'),
(2, 6, 'accepted'),
(2, 7, 'accepted'),
(2, 8, 'accepted'),
(3, 9, 'accepted'),
(3, 10, 'accepted'),
(3, 11, 'accepted'),
(4, 12, 'accepted'),
(4, 13, 'accepted'),
(4, 14, 'accepted'),
(5, 1, 'accepted'),
(5, 2, 'accepted'),
(5, 3, 'accepted'),
(5, 4, 'accepted'),
(6, 5, 'accepted'),
(6, 6, 'accepted'),
(6, 7, 'accepted'),
(6, 8, 'accepted'),
(7, 9, 'accepted'),
(7, 10, 'accepted'),
(7, 11, 'accepted'),
(8, 12, 'accepted'),
(8, 13, 'accepted'),
(8, 14, 'accepted'),
(9, 1, 'accepted'),
(9, 2, 'accepted'),
(9, 3, 'accepted'),
(9, 4, 'accepted'),
(10, 5, 'accepted'),
(10, 6, 'accepted'),
(10, 7, 'accepted'),
(10, 8, 'accepted'),
(11, 9, 'accepted'),
(11, 10, 'accepted'),
(11, 11, 'accepted');

-- Create test notifications
INSERT INTO notifications (user_id, match_id, type, message, delivery_status) VALUES
(1, 1, 'match_invite', 'You have been invited to a match.', 'pending'),
(2, 1, 'match_invite', 'You have been invited to a match.', 'pending'),
(3, 1, 'match_invite', 'You have been invited to a match.', 'pending'),
(4, 1, 'match_invite', 'You have been invited to a match.', 'pending'),
(5, 2, 'match_invite', 'You have been invited to a match.', 'pending'),
(6, 2, 'match_invite', 'You have been invited to a match.', 'pending'),
(7, 2, 'match_invite', 'You have been invited to a match.', 'pending'),
(8, 2, 'match_invite', 'You have been invited to a match.', 'pending'),
(9, 3, 'match_invite', 'You have been invited to a match.', 'pending'),
(10, 3, 'match_invite', 'You have been invited to a match.', 'pending'),
(11, 3, 'match_invite', 'You have been invited to a match.', 'pending'),
(12, 4, 'match_invite', 'You have been invited to a match.', 'pending'),
(13, 4, 'match_invite', 'You have been invited to a match.', 'pending'),
(14, 4, 'match_invite', 'You have been invited to a match.', 'pending'),
(1, 5, 'match_invite', 'You have been invited to a match.', 'pending'),
(2, 5, 'match_invite', 'You have been invited to a match.', 'pending'),
(3, 5, 'match_invite', 'You have been invited to a match.', 'pending'),
(4, 5, 'match_invite', 'You have been invited to a match.', 'pending'),
(5, 6, 'match_invite', 'You have been invited to a match.', 'pending'),
(6, 6, 'match_invite', 'You have been invited to a match.', 'pending'),
(7, 6, 'match_invite', 'You have been invited to a match.', 'pending');
