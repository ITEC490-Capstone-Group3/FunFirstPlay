# macOS Setup Instructions:

## 1. Install PostgreSQL (Using Homebrew)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql

# Start the PostgreSQL service
brew services start postgresql
```

## 2. Create Database and User

```bash
# Access PostgreSQL
psql postgres

# Next steps are on the PostgreSQL Terminal that opens
# Create the dev database
CREATE DATABASE ffp_dev;

# Create the dev user (Change user and password)
CREATE USER dev WITH ENCRYPTED PASSWORD 'dev_password';

# Grant privileges to the dev user
GRANT ALL PRIVILEGES ON DATABASE ffl_dev TO dev;

# Connect to the database
\c ffp_dev

# Grant schema privileges
GRANT ALL ON SCHEMA public TO dev;

# Exit PostgreSQL
\q
```

## 3. Create Database Schema and Add Test Data

```bash
# These commands are on the PostgreSQL Terminal
# Import the Schema
psql -U dev -d ffp_dev -f schema.sql

# Import sample data
pqsl -U dev -d ffp_dev -f sample_data.sql

# Run test queries
psql -U dev -d ffp_dev -f query_to_test.sql
```
