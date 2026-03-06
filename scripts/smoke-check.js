// scripts/smoke-check.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_FILE = path.resolve(__dirname, '..', 'dist', 'proto2.html');
// selectors.ts에서 REQUIRED_IDS를 동적으로 추출 (한글)
const SELECTORS_PATH = path.join(__dirname, '../src/ui/selectors.ts');
const selectorsContent = fs.readFileSync(SELECTORS_PATH, 'utf-8');
const idMatches = selectorsContent.match(/REQUIRED_IDS = \[([\s\S]*?)\]/);
const REQUIRED_IDS = idMatches
    ? idMatches[1].split(',').map(s => s.trim().replace(/SELECTORS\.|['"\s]/g, '')).filter(Boolean)
    : ['game-container', 'gameCanvas', 'lobby-overlay', 'battle-screen', 'p-hp'];

console.log(`🔍 [SMOKE CHECK] 필수 ID 목록: ${REQUIRED_IDS.join(', ')}`);

const DIST_DIR = path.join(__dirname, '../dist');
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

// 스크립트 로드 확인 (한글)
if (!content.includes('type="module"') && !content.includes('<script')) {
    console.error(`❌ [SMOKE CHECK FAILED] 스크립트 태그가 없습니다!`);
    failed = true;
} else {
    console.log(`  ✅ 스크립트 로드 태그 확인`);
}

if (failed) {
    console.error('\n⛔ 스모크 체크 실패 — 배포를 중단합니다.');
    process.exit(1);
}

console.log('\n✅ [SMOKE CHECK PASSED] 모든 필수 DOM 요소 확인. 배포를 계속합니다.\n');
