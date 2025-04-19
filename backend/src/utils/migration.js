const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('./logger');

// Path to schema SQL file - try multiple potential locations
let schemaFilePath;
const possiblePaths = [
  path.join(__dirname, '../../../database/sql/schema.sql'),
  path.join(__dirname, '../../database/sql/schema.sql'),
  path.join(__dirname, '../database/sql/schema.sql'),
  path.join(__dirname, '../../sql/schema.sql'),
  path.join(__dirname, '../sql/schema.sql'),
  '/opt/funfirstplay/database/sql/schema.sql'
];

// Find the first path that exists
for (const potentialPath of possiblePaths) {
  try {
    if (fs.existsSync(potentialPath)) {
      schemaFilePath = potentialPath;
      break;
    }
  } catch (err) {
    // Ignore errors and try the next path
  }
}

if (!schemaFilePath) {
  console.error('Could not find schema.sql file in any of the expected locations.');
  console.error('Please make sure the database/sql/schema.sql file is available.');
  process.exit(1);
}

/**
 * Initialize database tables
 */
async function initializeDatabase() {
  logger.info('Starting database initialization...');
  
  try {
    // Read schema SQL
    const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');
    
    const client = await pool.connect();
    try {
      // Run schema SQL
      logger.info('Creating database tables...');
      await client.query(schemaSql);
      logger.info('Database schema successfully initialized');
      
      // Check if tables were created
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tables = tableCheck.rows.map(row => row.table_name);
      logger.info(`Created tables: ${tables.join(', ')}`);
      
    } finally {
      client.release();
    }
    
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error(`Error initializing database: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  initializeDatabase
};