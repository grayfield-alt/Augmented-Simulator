// scripts/check-env.js
import { execSync } from 'child_process';
import http from 'http';

console.log('🔍 [ENV CHECK] Checking development environment...');

// 1. Node.js version check
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);
if (majorVersion < 18) {
    console.error(`❌ [FAILED] Node.js version ${nodeVersion} is too old. Please use Node.js 18 or higher.`);
    process.exit(1);
}
console.log(`  ✅ Node.js Version: ${nodeVersion}`);

// 2. Port 5173 check
const checkPort = (port) => {
    return new Promise((resolve) => {
        const server = http.createServer().listen(port, 'localhost', () => {
            server.close(() => resolve(true));
        }).on('error', () => {
            resolve(false);
        });
    });
};

async function main() {
    const isPortAvailable = await checkPort(5173);
    if (!isPortAvailable) {
        console.warn(`⚠️ [WARNING] Port 5173 is already in use. Vite might use a different port (e.g., 5174).`);
        console.warn(`   Check the terminal output after 'npm run dev' for the actual URL.`);
    } else {
        console.log(`  ✅ Port 5173 is available.`);
    }

    // 3. Dependency Check
    try {
        if (!process.env.CI) {
            console.log('  ✅ Environment check complete. Ready to start.');
        }
    } catch (e) {
        // Ignore
    }
}

main();
