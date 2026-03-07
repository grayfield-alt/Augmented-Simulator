// scripts/smoke-check.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_FILE = path.resolve(__dirname, '..', 'dist', 'proto2.html');
// 1. 하드코딩된 필수 DOM ID 목록 (정규식 파싱 오류 원천 차단)
const REQUIRED_IDS = [
    'game-container',
    'gameCanvas',
    'lobby-overlay',
    'battle-screen',
    'p-hp',
    'p-atk',
    'p-def',
    'p-ap',
    'btn-start',
    'turn-indicator-overlay'
];

console.log(`🔍 [SMOKE CHECK] 필수 ID 목록: ${REQUIRED_IDS.join(', ')}`);

const DIST_DIR = path.join(__dirname, '../dist');
console.log('\n🔍 [SMOKE CHECK] 배포 산출물 DOM 무결성 검사 시작...');

if (!fs.existsSync(DIST_FILE)) {
    console.error(`\n❌ [SMOKE CHECK FAILED] dist/proto2.html 파일이 존재하지 않습니다!`);
    process.exit(1);
}

const content = fs.readFileSync(DIST_FILE, 'utf-8');
let failed = false;

// 2. 개발 엔트리(/src/main.ts) 참조 여부 확인 (한글)
if (content.includes('src="/src/main.ts"') || content.includes('src="./src/main.ts"')) {
    console.error(`❌ [SMOKE CHECK FAILED] 빌드된 HTML이 여전히 개발 엔트리(/src/main.ts)를 참조하고 있습니다.`);
    failed = true;
} else {
    console.log(`  ✅ 최적화 엔트리 검증 통과 (개발 소스 참조 없음)`);
}

// 3. 번들된 자바스크립트 로드 태그 및 실제 파일 존재 확인 (한글)
const scriptMatch = content.match(/src=["'].*?(assets\/index-[^"']+\.js)["']/);
if (!scriptMatch) {
    console.error(`❌ [SMOKE CHECK FAILED] 빌드된 HTML 내에 올바른 스크립트 연결(assets/*.js)이 없습니다.`);
    failed = true;
} else {
    console.log(`  ✅ 스크립트 로드 태그 확인: ${scriptMatch[1]}`);
    const assetFilePath = path.join(DIST_DIR, scriptMatch[1]);
    if (!fs.existsSync(assetFilePath)) {
        console.error(`❌ [SMOKE CHECK FAILED] HTML에서 참조하는 물리적 JS 파일이 존재하지 않습니다: ${scriptMatch[1]}`);
        failed = true;
    } else {
        console.log(`  ✅ 컴파일된 JS 파일 물리적 위치 확인`);
    }
}

// 4. 필수 DOM 요소 존재 여부 확인 (한글)
for (const id of REQUIRED_IDS) {
    const pattern = new RegExp(`id=["']${id}["']`);
    if (!pattern.test(content)) {
        console.error(`❌ [SMOKE CHECK FAILED] 필수 DOM 요소가 부족합니다: #${id}`);
        failed = true;
    } else {
        console.log(`  ✅ #${id} 존재 확인`);
    }
}

// 캔버스 렌더 루프 존재 여부 자동 검증 제거 (빌드 시 minify/mangle로 인해 문자열 깨짐 발생 방지)

if (failed) {
    console.error('\n⛔ 스모크 체크 실패 — 배포를 중단합니다.');
    process.exit(1);
}

console.log('\n✅ [SMOKE CHECK PASSED] 모든 필수 DOM 요소 확인. 배포를 계속합니다.\n');
