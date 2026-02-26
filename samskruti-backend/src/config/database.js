const { Pool } = require('pg');
require('dotenv').config();

console.log('🔄 Attempting to connect to database...');
console.log('📊 Database config:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  ssl: true
});

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 5, // Reduce max connections for testing
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(poolConfig);

// Test connection with timeout
const testConnection = async () => {
  const client = await pool.connect();
  try {
    // Test query to check schema
    const tableCheck = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Connected to database!');
    console.log('📊 Users table schema:');
    tableCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error checking schema:', err.message);
    return false;
  } finally {
    client.release();
  }
};

// Attempt connection with retry
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log(`✅ Database connection attempt ${i + 1} successful!`);
      client.release();
      
      // Test the connection and check schema
      await testConnection();
      return true;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      
      if (err.code === '28P01') {
        console.error('🔑 Authentication failed - check username/password');
      } else if (err.code === 'ECONNREFUSED') {
        console.error('🔌 Connection refused - check if database is accessible');
      } else if (err.code === 'ETIMEDOUT') {
        console.error('⏰ Connection timeout - check network/firewall settings');
      }
      
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ All database connection attempts failed');
  console.log('⚠️ Server will continue running in limited mode');
  return false;
};

// Start connection attempt
connectWithRetry();

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};