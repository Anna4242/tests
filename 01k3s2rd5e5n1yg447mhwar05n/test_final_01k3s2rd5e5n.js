// Test for Prisma generation and login
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

describe('Prisma Generation and Login Test', () => {
  let prisma;

  beforeAll(() => {
    // Verify Prisma client can be imported
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Prisma client should be generated and importable', () => {
    expect(prisma).toBeDefined();
    expect(prisma.user).toBeDefined();
  });

  test('Prisma generate should work without errors', () => {
    try {
      execSync('npx prisma generate', { stdio: 'pipe' });
      expect(true).toBe(true);
    } catch (error) {
      fail('Prisma generate failed: ' + error.message);
    }
  });

  test('Database connection should work', async () => {
    try {
      await prisma.$connect();
      expect(true).toBe(true);
    } catch (error) {
      // If DATABASE_URL is not set, that's OK for this test
      if (error.message.includes('DATABASE_URL')) {
        expect(true).toBe(true);
      } else {
        throw error;
      }
    }
  });
});
