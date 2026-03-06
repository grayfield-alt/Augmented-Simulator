// scripts/postbuild.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const protoPath = path.join(distDir, 'proto2.html');

if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, protoPath);
    console.log('✅ Synchronized index.html to proto2.html');
} else {
    console.warn('⚠️ dist/index.html not found, synchronization skipped.');
}
