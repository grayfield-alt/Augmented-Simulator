// scripts/sync-dist.js (한글)
const fs = require('fs');
const path = require('path');

// 재귀적 디렉토리 복구/삭제 함수 (표준 모듈용) (한글)
function deleteFolderRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

    if (fs.lstatSync(source).isDirectory()) {
        const files = fs.readdirSync(source);
        files.forEach((file) => {
            const curSource = path.join(source, file);
            const curTarget = path.join(target, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, curTarget);
            } else {
                fs.copyFileSync(curSource, curTarget);
            }
        });
    }
}

function sync() {
    const rootDir = path.resolve(__dirname, '..');
    const distDir = path.join(rootDir, 'dist');
    const assetsDir = path.join(rootDir, 'assets');
    const targetHtml = path.join(rootDir, 'proto2.html');

    console.log('--- V3 Standard Deployment Sync Started ---');

    try {
        if (fs.existsSync(assetsDir)) {
            console.log('Cleaning assets...');
            deleteFolderRecursive(assetsDir);
        }

        const distAssetsArr = path.join(distDir, 'assets');
        if (fs.existsSync(distAssetsArr)) {
            console.log('Copying assets to root...');
            copyFolderRecursiveSync(distAssetsArr, assetsDir);
        }

        const distHtml = path.join(distDir, 'index.html');
        if (fs.existsSync(distHtml)) {
            console.log('Syncing proto2.html...');
            fs.copyFileSync(distHtml, targetHtml);
        }

        console.log('--- V3 Sync Completed ---');
    } catch (err) {
        console.error('Sync error:', err);
    }
}

sync();
