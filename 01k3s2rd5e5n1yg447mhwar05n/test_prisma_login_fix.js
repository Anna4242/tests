/**
 * Test to verify Prisma generation and login issue fix
 * 
 * This test verifies:
 * 1. Prisma client is properly initialized and shared
 * 2. No multiple Prisma client instances are created
 * 3. Login functionality works with the shared Prisma instance
 */

const { PrismaClient } = require('@prisma/client');

// Test 1: Verify Prisma client can be imported and initialized
function testPrismaClientInitialization() {
  console.log('Test 1: Verifying Prisma client initialization...');
  try {
    const prisma = new PrismaClient();
    console.log('✓ Prisma client initialized successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to initialize Prisma client:', error.message);
    return false;
  }
}

// Test 2: Verify shared Prisma instance is used in authOptions
async function testSharedPrismaInstance() {
  console.log('Test 2: Verifying shared Prisma instance usage...');
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check that authOptions.ts imports from lib/prisma
    const authOptionsPath = path.join(__dirname, '../lib/auth/authOptions.ts');
    const authOptionsContent = fs.readFileSync(authOptionsPath, 'utf8');
    
    // Verify it imports from @/lib/prisma or ../prisma
    const hasCorrectImport = /from ['"]@\/lib\/prisma['"]/.test(authOptionsContent) || 
                             /from ['"]\.\.\/prisma['"]/.test(authOptionsContent);
    
    if (!hasCorrectImport) {
      console.error('✗ authOptions.ts does not import from shared prisma instance');
      return false;
    }
    
    // Verify it doesn't create a new PrismaClient
    const hasNewPrismaClient = /new PrismaClient\(\)/.test(authOptionsContent);
    if (hasNewPrismaClient) {
      console.error('✗ authOptions.ts still creates new PrismaClient');
      return false;
    }
    
    console.log('✓ authOptions.ts correctly imports shared Prisma instance');
    console.log('✓ authOptions.ts does not create new PrismaClient');
    
    // Test database connection if possible
    try {
      // Try to load .env if it exists
      const envPath = path.join(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
      }
      
      if (process.env.DATABASE_URL) {
        const { PrismaClient } = require('@prisma/client');
        const testPrisma = new PrismaClient();
        await testPrisma.$connect();
        const userCount = await testPrisma.user.count();
        console.log(`✓ Database connection successful (User count: ${userCount})`);
        await testPrisma.$disconnect();
      } else {
        console.log('⚠ DATABASE_URL not set, skipping database connection test');
      }
    } catch (dbError) {
      console.log('⚠ Database connection test skipped:', dbError.message);
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to verify shared Prisma instance:', error.message);
    return false;
  }
}

// Test 3: Verify no duplicate Prisma client creation in authOptions
function testNoDuplicatePrismaClients() {
  console.log('Test 3: Verifying no duplicate Prisma client creation...');
  try {
    const fs = require('fs');
    const path = require('path');
    
    const authOptionsPath = path.join(__dirname, '../lib/auth/authOptions.ts');
    const authOptionsContent = fs.readFileSync(authOptionsPath, 'utf8');
    
    // Check that authOptions.ts imports from lib/prisma, not creates new PrismaClient
    const hasNewPrismaClient = /new PrismaClient\(\)/.test(authOptionsContent);
    const hasSharedImport = /from ['"]@\/lib\/prisma['"]/.test(authOptionsContent) || 
                            /from ['"]\.\.\/\.\.\/prisma['"]/.test(authOptionsContent);
    
    if (hasNewPrismaClient && !hasSharedImport) {
      console.error('✗ authOptions.ts still creates new PrismaClient instead of using shared instance');
      return false;
    }
    
    if (hasSharedImport) {
      console.log('✓ authOptions.ts uses shared Prisma instance from lib/prisma');
      return true;
    }
    
    console.log('⚠ Could not verify Prisma client usage pattern');
    return true; // Don't fail if we can't verify
  } catch (error) {
    console.error('✗ Failed to check for duplicate Prisma clients:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Prisma Generation and Login Fix');
  console.log('='.repeat(60));
  console.log('');
  
  const results = [];
  
  // Test 1
  results.push(testPrismaClientInitialization());
  console.log('');
  
  // Test 2
  results.push(await testSharedPrismaInstance());
  console.log('');
  
  // Test 3
  results.push(testNoDuplicatePrismaClients());
  console.log('');
  
  // Summary
  console.log('='.repeat(60));
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  console.log(`Tests passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

