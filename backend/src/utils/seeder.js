const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('./logger');

// Path to test data SQL file
const testDataFilePath = path.join(__dirname, '../../../database/sql/test_data.sql');

/**
 * Seed database with initial data
 */
async function seedDatabase() {
  logger.info('Starting database seeding...');
  
  try {
    // Read test data SQL
    const testDataSql = fs.readFileSync(testDataFilePath, 'utf8');
    
    const client = await pool.connect();
    try {
      // Run test data SQL
      logger.info('Inserting test data...');
      await client.query(testDataSql);
      logger.info('Test data successfully inserted');
      
      // Check count of inserted records for some tables
      const tables = ['users', 'sports', 'skill_levels'];
      
      for (const table of tables) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        logger.info(`Inserted ${countResult.rows[0].count} records into ${table}`);
      }
      
    } finally {
      client.release();
    }
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run seeder if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase
};