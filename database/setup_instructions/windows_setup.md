# Windows Setup Instructions:

## 1. Install PostgreSQL (Using Homebrew)

1. Download the PostgreSQL installer from the [PostgreSQL Website](https://www.postgresql.org/download/windows/).
2. Run the installer and follow the setup wizard.
3. Remember the password you set for the 'postgres' user.
4. Ensure the PostgreSQL service is running.

## 2. Create Database and User

```cmd
REM These commands are using command prompt
REM Create the dev database
psql -U postgres -c "CREATE DATABASE ffp_dev"

REM Create the dev user (Change user and password)
psql -U postgres -c "CREATE USER dev WITH ENCRYPTED PASSWORD 'dev_password'"

REM Grant privileges to the dev user
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ffl_dev TO dev"

REM Connect and Grant schema privileges
psql -U postgres -d ffp_dev -c "GRANT ALL ON SCHEMA public TO dev"
```

## 3. Create Database Schema and Add Test Data

```cmd
REM Import the Schema
psql -U dev -d ffp_dev -f schema.sql

REM Import sample data
pqsl -U dev -d ffp_dev -f sample_data.sql

REM Run test queries
psql -U dev -d ffp_dev -f query_to_test.sql
```
