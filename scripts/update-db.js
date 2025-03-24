#!/usr/bin/env node

/**
 * Post-deployment script to update the database schema
 * Run this after deploying to Vercel to update your production database
 * Usage: node scripts/update-db.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Database Schema Update Tool');
console.log('==============================');
console.log('This script will help you update your production database schema after deployment.');
console.log('');

rl.question('Do you want to use "prisma db push" or "prisma migrate deploy"? (push/migrate): ', (answer) => {
  const command = answer.toLowerCase().trim() === 'migrate' 
    ? 'npx prisma migrate deploy' 
    : 'npx prisma db push';
  
  console.log(`\nRunning: ${command}`);
  console.log('This may take a moment...\n');
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log('\n✅ Database schema updated successfully!');
  } catch (error) {
    console.error('\n❌ Error updating database schema:');
    console.error(error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your DATABASE_URL environment variable is correctly set');
    console.log('2. Check that your database server is accessible');
    console.log('3. Ensure your database user has the necessary permissions');
    console.log('4. Verify that your Prisma schema is valid');
  } finally {
    rl.close();
  }
});

rl.on('close', () => {
  console.log('\nThank you for using the Database Schema Update Tool!');
  process.exit(0);
}); 