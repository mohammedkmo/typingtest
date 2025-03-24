#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests your database connection using the DATABASE_URL from your .env file
 * It helps troubleshoot connection issues before or after deployment
 * 
 * Usage: node scripts/test-db-connection.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set.');
  console.log('Please make sure you have a .env file with DATABASE_URL defined.');
  process.exit(1);
}

// Parse connection string
function parseConnectionString(connectionString) {
  try {
    // mysql://username:password@host:port/database
    const url = new URL(connectionString);
    
    return {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remove leading '/'
      ssl: url.searchParams.get('ssl') === 'true'
    };
  } catch (error) {
    console.error('❌ Error parsing connection string:', error.message);
    console.log('Your DATABASE_URL should be in format: mysql://username:password@host:port/database');
    process.exit(1);
  }
}

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('--------------------------------');
  
  const config = parseConnectionString(DATABASE_URL);
  
  // Don't show password in logs
  const configSafe = { ...config };
  configSafe.password = '********';
  console.log('Connection configuration:', configSafe);
  
  let connection;
  
  try {
    console.log('\n🔄 Connecting to MySQL database...');
    connection = await mysql.createConnection(config);
    
    console.log('✅ Connection established successfully!');
    
    // Test a basic query
    console.log('\n🔄 Testing a simple query...');
    const [rows] = await connection.execute('SELECT 1 as result');
    console.log('✅ Query executed successfully. Result:', rows[0].result);
    
    // Check if we can access the database
    console.log('\n🔄 Testing access to the specified database...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Database access confirmed. Found ${tables.length} tables.`);
    
    if (tables.length > 0) {
      console.log('Tables in database:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(` - ${tableName}`);
      });
    }
    
    console.log('\n✅ All tests passed! Your database connection is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Connection error:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check that your MySQL server is running');
    console.log('2. Verify that the database exists');
    console.log('3. Confirm that username and password are correct');
    console.log('4. Make sure the host is accessible (firewall settings, network access)');
    console.log('5. If using SSL, make sure SSL is configured correctly');
    
    if (error.message.includes('Access denied')) {
      console.log('\n👉 This looks like an authentication issue. Check your username and password.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n👉 Could not connect to the database server. Check that the server is running and accessible.');
    } else if (error.message.includes('ER_BAD_DB_ERROR')) {
      console.log('\n👉 The database does not exist. Create it or use a different database name.');
    } else if (error.message.includes('certificate')) {
      console.log('\n👉 SSL certificate issue. Try adding ?ssl=false to your connection string or configure SSL properly.');
    }
  } finally {
    if (connection) {
      console.log('\n🔄 Closing connection...');
      await connection.end();
      console.log('✅ Connection closed.');
    }
  }
}

testConnection(); 