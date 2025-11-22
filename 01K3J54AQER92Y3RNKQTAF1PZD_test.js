/**
 * Test for Task #9: Fix TypeScript build error in AudioSystem.ts
 * Instance ID: 01K3J54AQER92Y3RNKQTAF1PZD
 * 
 * This test validates that:
 * 1. The TypeScript build completes without errors
 * 2. The unused oscillator variable warning is suppressed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing Task #9: AudioSystem.ts fix...\n');

// Test 1: Verify the patch file exists
const patchPath = path.join(__dirname, '..', '..', 'task9_patch.patch');
if (!fs.existsSync(patchPath)) {
  console.error('❌ Patch file not found:', patchPath);
  process.exit(1);
}
console.log('✅ Patch file exists');

// Test 2: Verify the fix is applied in AudioSystem.ts
const audioSystemPath = path.join(__dirname, 'src', 'systems', 'AudioSystem.ts');
const audioSystemContent = fs.readFileSync(audioSystemPath, 'utf-8');

if (!audioSystemContent.includes('// eslint-disable-next-line @typescript-eslint/no-unused-vars')) {
  console.error('❌ ESLint comment not found in AudioSystem.ts');
  process.exit(1);
}
console.log('✅ ESLint suppression comment found');

if (!audioSystemContent.includes('// @ts-expect-error')) {
  console.error('❌ TypeScript error suppression comment not found');
  process.exit(1);
}
console.log('✅ TypeScript error suppression comment found');

// Test 3: Verify TypeScript build succeeds
try {
  console.log('\nRunning TypeScript build...');
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: __dirname,
    encoding: 'utf-8'
  });
  console.log('\n✅ TypeScript build completed successfully!');
} catch (error) {
  console.error('\n❌ TypeScript build failed');
  process.exit(1);
}

// Test 4: Verify the dist folder was created
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not created');
  process.exit(1);
}
console.log('✅ Build output (dist) folder created');

console.log('\n🎉 All tests passed! The fix is working correctly.');

