# Linux (.deb based) Setup Instructions:

## 1. Install PostgresSQL

```bash
# Update package lists
sudo apt update

# Install PostgreSQL and necessary packages
sudo apt install postgresql postgresql-contrib

# Verify installation
sudo systemctl status postgresql
```

## 2. Create Database and User

```bash
# Acess PostgreSQL as the postgres user
sudo -u postgres psql

# Create the dev database
CREATE DATABASE ffp_dev;

# Create the dev user (Change user and password)
CREATE USER dev WITH ENCRYPTED PASSWORD 'dev_password';

# Grant privileges to the dev user
GRANT ALL PRIVILEGES ON DATABASE ffp_dev TO dev;

# Connect to the database
\c ffp_dev

# Grant schema privileges
GRANT ALL ON SCHEMA public TO dev;

# Exit PostgreSQL
\q
```

## 3. Create Database Schema and Add Test Data

```bash
# Import the Schema
psql -U dev -d ffp_dev -f schema.sql

# Import sample data
pqsl -U dev -d ffp_dev -f sample_data.sql

# Run test queries
psql -U dev -d ffp_dev -f query_to_test.sql
```
