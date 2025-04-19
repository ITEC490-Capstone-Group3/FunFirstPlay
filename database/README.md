# FunFirstPlay Database Documentation

## Database Software

This project uses a PostgreSQL database hosted on Digital Ocean's managed database service.

## Database Configuration

- Host: <your_database_host>.m.db.ondigitalocean.com
- Port: 25060
- User: doadmin
- Database: defaultdb
- SSL Mode: require

## Database Schema

The database schema creation sql: [schema.sql](sql/schema.sql).

## Entity Relationship Diagram (ERD)

### ERD Explanation

- Users and their data:
  - USERS store personal information and preferences.
  - Each user has a unique username.
  - Each user can have multiple USER_SPORTS (sports they play with skill levels).
  - Users set their AVAILABILITY (when they can play).
  - Users participate in matches via MATCH_PLAYERS records.
  - Users receive NOTIFICATIONS about match invites and updates.

- Sports and Skill Levels:
  - SPORTS contains all available sports with their requirements.
  - SKILL_LEVELS defines the proficiency levels (ForFun, Learning, Intermediate, etc.).
  - USER_SPORTS connects users to their sports and skill levels.

- Match Management:
  - MATCHES stores all game sessions with timing, location, and requirements.
  - MATCH_PLAYERS tracks who's invited and their response status.
  - PLAYER_RESPONSES records each acceptance/rejection with timestamps.
  - NOTIFICATIONS handles alerting users about matches.

- Time Management:
  - AVAILABILITY stores when users are free to play.
  - The recurrence_rule field enables patterns like "every Tuesday at 7pm".

- Mermaid code can be viewed as a diagram online at [Mermaid Live](https://mermaid.live).
- Mermaid code can be viewed as a diagram in VSCode using the extension [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid).

![ERD](erd/erd.svg)
