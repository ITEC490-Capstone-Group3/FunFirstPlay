import { Pool } from 'pg';

const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'funfirstplay',
    password: 'your_password',
    port: 5432, // Default PostgreSQL port
});

export default pool;

// HI