import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..');
const targetDir = path.join(__dirname, '../deploy');

// Folders and files to include in the deployment
const include = [
  'config',
  'controllers',
  'middleware',
  'routes',
  'utils',
  'server.js',
  'swagger.js',
  'package.json',
  '.env',
  'database.json',
  'migrations',
  'public',
  'uploads'
];

async function prepareDeploy() {
  console.log('🚀 Preparing deployment folder...');

  // 1. Clean/Create target directory
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir);

  // 2. Copy items
  for (const item of include) {
    let srcPath = path.join(sourceDir, item);
    let destPath = path.join(targetDir, item);

    // Special handling for .env: Use .env.production if it exists
    if (item === '.env' && fs.existsSync(path.join(sourceDir, '.env.production'))) {
      srcPath = path.join(sourceDir, '.env.production');
      console.log('📝 Using .env.production for deployment');
    }

    if (fs.existsSync(srcPath)) {
      if (fs.lstatSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`✅ Copied folder: ${item}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied file: ${item}`);
      }
    } else {
      console.warn(`⚠️ Warning: ${item} not found, skipping.`);
    }
  }

  console.log('\n✨ Deployment folder ready at: ./backend/deploy');
  console.log('📦 You can now ZIP the contents of the "deploy" folder and upload it to Namecheap.');
}

prepareDeploy().catch(err => {
  console.error('❌ Error preparing deployment:', err);
  process.exit(1);
});
