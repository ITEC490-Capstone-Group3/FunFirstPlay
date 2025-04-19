const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

// Digital Ocean managed PostgreSQL database configuration
const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    ssl: process.env.DB_SSL_MODE === 'require' ? {
        rejectUnauthorized: false, // Allow self-signed certificates
        sslmode: 'require'
    } : false,
    // Connection pool settings for optimal Digital Ocean database usage
    max: parseInt(process.env.DB_MAX_CONNECTIONS), 
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 15000,
};

// Create the connection pool
const pool = new Pool(config);

// Pool event handlers
pool.on('connect', () => {
    logger.debug('New client connected to Digital Ocean PostgreSQL database');
});

pool.on('error', (err, client) => {
    logger.error(`Unexpected error on idle client: ${err.message}`);
    
    // Don't crash the server on connection errors - attempt reconnection
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        logger.warn('Database connection lost, pools will automatically attempt to reconnect');
    } else {
        logger.error(`Critical database error: ${err.stack}`);
        process.exit(-1); // Exit on critical database errors
    }
});

// Test database connection at startup
const testDatabaseConnection = async () => {
    let retries = 3;
    while (retries) {
        try {
            const client = await pool.connect();
            logger.info('Successfully connected to Digital Ocean PostgreSQL database');
            
            // Get PostgreSQL version
            const versionResult = await client.query('SELECT version()');
            logger.info(`PostgreSQL Version: ${versionResult.rows[0].version}`);
            
            client.release();
            return;
        } catch (err) {
            retries -= 1;
            logger.error(`Database connection error: ${err.message}`);
            
            if (retries <= 0) {
                logger.error('Failed to connect to database after multiple attempts');
                logger.error('Exiting application due to database connection failure');
                process.exit(1);
            }
            
            // Wait 5 seconds before retrying
            logger.info(`Retrying connection in 5 seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

// Query wrapper with logging and error handling
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log queries that take longer than expected
        if (duration > 200) {
            logger.warn(`Slow query: ${text}, Duration: ${duration}ms, Rows: ${res.rowCount}`);
        } else {
            logger.debug(`Query executed: ${text}, Duration: ${duration}ms, Rows: ${res.rowCount}`);
        }
        
        return res;
    } catch (err) {
        // Don't log sensitive parameters
        const sanitizedParams = '[PARAMS REDACTED]';
            
        logger.error(`Query error: ${err.message}, Query: ${text}, Params: ${sanitizedParams}`);
        throw err;
    }
};

// Helper function for transactions
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Initialize the database connection
testDatabaseConnection();

module.exports = {
    pool,
    query,
    transaction
};
