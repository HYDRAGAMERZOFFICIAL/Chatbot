#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('Collegewala - Dependency Installation');
console.log('========================================');
console.log('');

const packageJsonPath = path.join(__dirname, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found');
  console.error('Please run this script from the project root directory');
  process.exit(1);
}

try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  console.log('Found Node.js version:', nodeVersion);

  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log('Found npm version:', npmVersion);
  console.log('');

  console.log('Installing dependencies...');
  console.log('');

  execSync('npm install', { stdio: 'inherit' });

  console.log('');
  console.log('========================================');
  console.log('Successfully installed all dependencies!');
  console.log('========================================');
  console.log('');
  console.log('Next steps:');
  console.log('  - Development: npm run dev');
  console.log('  - Build: npm run build');
  console.log('  - Tests: npm test');
  console.log('  - Linting: npm run lint');
  console.log('');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
