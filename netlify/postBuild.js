// netlify/postBuild.js
const fse = require('fs-extra');
const { execSync } = require('child_process');

// Step 1: Compile functions from functions/*.ts → netlify/functions/*.js
console.log('🔧 Compiling TypeScript functions...');
execSync('npx tsc --project functions/tsconfig.json', { stdio: 'inherit' });

// Step 2: Copy compiled JS files
fse.ensureDirSync('netlify/functions');
fse.copySync('functions/dist', 'netlify/functions');

console.log('✅ Functions built and copied!');