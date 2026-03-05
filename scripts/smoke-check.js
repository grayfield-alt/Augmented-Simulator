// scripts/smoke-check.js
// CI에서 실행: 빌드 산출물(dist/proto2.html)에 핵심 DOM ID가 존재하는지 검증합니다.
const fs = require('fs');
const path = require('path');

const DIST_FILE = path.resolve(__dirname, '..', 'dist', 'proto2.html');
const REQUIRED_IDS = [
    'game-container',
    'play-area',
    'bottom-ui',
    'top-status',
    'gameCanvas'
];

console.log('\n🔍 [SMOKE CHECK] 배포 산출물 DOM 무결성 검사 시작...');

if (!fs.existsSync(DIST_FILE)) {
    console.error(`\n❌ [SMOKE CHECK FAILED] dist/proto2.html 파일이 존재하지 않습니다!`);
    process.exit(1);
}

const content = fs.readFileSync(DIST_FILE, 'utf-8');
let failed = false;

for (const id of REQUIRED_IDS) {
    const pattern = new RegExp(`id=["']${id}["']`);
    if (!pattern.test(content)) {
        console.error(`❌ [SMOKE CHECK FAILED] 필수 DOM 요소가 없습니다: #${id}`);
        failed = true;
    } else {
        console.log(`  ✅ #${id} 존재 확인`);
    }
}

if (failed) {
    console.error('\n⛔ 스모크 체크 실패 — 배포를 중단합니다.');
    process.exit(1);
}

console.log('\n✅ [SMOKE CHECK PASSED] 모든 필수 DOM 요소 확인. 배포를 계속합니다.\n');
