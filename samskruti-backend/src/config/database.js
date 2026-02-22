const { Pool } = require('pg');
require('dotenv').config();

// Log the connection attempt (without password)
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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds
  ssl: {
    rejectUnauthorized: false // Required for Render
  }
};

const pool = new Pool(poolConfig);

// Test database connection with better error handling
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error details:');
    console.error('  - Code:', err.code);
    console.error('  - Message:', err.message);
    
    if (err.code === 'ETIMEDOUT') {
      console.error('  ⏰ Connection timed out. Check if:');
      console.error('    1. Your database host is correct');
      console.error('    2. Your IP is allowlisted in Render');
      console.error('    3. The database is running');
      console.error('    4. You have the correct password');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('  🔌 Connection refused. Check if:');
      console.error('    1. The database port is correct (5432)');
      console.error('    2. The database is accessible');
    } else if (err.code === '28P01') {
      console.error('  🔑 Authentication failed. Check your username and password');
    }
    
    // Don't exit, let the server try to reconnect
    console.log('⚠️ Server will continue running, but database features will not work');
  } else {
    console.log('✅ Successfully connected to database!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🌍 Host: ${process.env.DB_HOST}`);
    release();
  }
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};