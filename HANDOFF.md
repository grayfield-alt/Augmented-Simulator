# 🚀 Antigravity Handoff Status

## 🏁 Start Checklist (작업 전 확인 사항)
- [ ] `git pull origin main` 실행 완료
- [ ] `npm install` 실행 완료
- [ ] 터미널에서 `npm run handoff` 실행하여 Agent Prompt 복사 후 전송

## 💬 Agent Start Prompt (한 줄 복붙)
```
git pull 받았어. 프로젝트 루트에 있는 HANDOFF.md 파일 읽고 하던 작업 이어서 해줘.
```

---

## 📸 현재 Git 상태 (2026-03-06T20:20 KST 기준)

| 항목 | 내용 |
|------|------|
| **로컬 브랜치** | `main` |
| **로컬 최신 커밋** | `8676e97` fix: restore game to index.html and update deploy workflow for reliability |
| **원격 origin/main** | 로컬보다 **4커밋 앞서 있음** (패스트포워드 가능) |
| **Push 상태** | ❌ **오늘 작업분은 미push** - 변경사항이 로컬에만 있음 |

### 스테이지되지 않은 변경 파일 목록 (오늘 작업분)
- `eslint.config.js` — V3 린트 범위 한정 및 TS/레거시 제외
- `index.html` — HTML 제어문자 제거 (parse5 오류 수정 완료)
- `package.json` — `npm run check` 스크립트, `lint` 범위 V3 한정
- `proto2.html` — 영구 리다이렉트 스텁으로 고정
- `src/main.ts` — Event Delegation 버튼 바인딩, `initDebugger()` 연동
- `vite.config.js` — serve/build 환경별 base 동적 분기

### 미추적 신규 파일
- `src/utils/debugger.ts` — 디버그 HUD/에러 오버레이/클릭 가로채기 감지 모듈
- `proto2_tail.txt` — 임시 파일, 무시해도 됨

---

## 🎯 Current Goal (현재 목표)
**Start 버튼이 동작하는 것을 확실히 확인 + 2채널 배포 구축**
- 안정판(프로덕션): `/proto2.html` — 항상 Start/전투 3턴이 동작해야 함
- 프리뷰: `/dev/index.html` — 개발 최신 버전 테스트용 (깨져도 됨)

---

## ✅ Done (오늘 완료된 작업)
- `index.html` HTML 파싱 에러(parse5 control-character) 완벽 제거 → `npm run build` 경고 0
- `proto2.html` 영구 리다이렉트 스텁으로 고정 (직접 수정 금지 엔트리 규칙 명시)
- `vite.config.js` 환경별 base 동적 분기 (`serve`=`/`, `build`=`/Augmented-Simulator/`)
- `src/utils/debugger.ts` 전역 디버그 HUD 작성:
  - Start Bind 상태/inputLocked/lastAction/lastError 실시간 표시
  - Start 클릭 후 500ms 내 미전환 시 원인 자동 출력
  - `window.onerror` + `unhandledrejection` 화면 오버레이 노출
  - Capture Phase 클릭 감지로 버튼 위 오버레이 덮힘 여부 감지
- `npm run check` 스크립트 (lint+build 통합 파이프라인) 추가

---

## 🔴 현재 막힌 이슈 (아직 해결 안 됨)

### 문제: Start 버튼이 눌려도 게임이 시작 안 됨 (추정)

**원인 후보 및 확인 방법:**

| # | 후보 원인 | 확인 방법 |
|---|-----------|-----------|
| 1 | `src/main.ts` (V3 모듈)가 로드는 됐지만, 인라인 `<script>`의 `startGame`이 아직 정의되지 않은 시점에 Event Delegation 바인딩이 실행됨 | 로컬에서 DevTools > Console > `typeof window.startGame` 입력, `function`이면 OK |
| 2 | `index.html` 내부의 1400줄 인라인 `<script>` 내에 남아있는 깨진 한글 문자(`?`)가 JS 런타임 파싱 에러 유발 | DevTools > Console에 빨간 SyntaxError가 찍히는지 확인 |
| 3 | `src/main.ts`가 `index.html`의 `<script type="module">` 태그로 연결이 안 돼 있어 V3 코드 자체가 실행 안 됨 | DevTools > Network 탭에서 `main.ts` 또는 `assets/index-*.js` 요청이 200으로 뜨는지 확인 |

---

## ⏳ Next 3 Steps (내일 할 작업 - 구체적 명령/파일 기준)

**Step 1: 오늘 변경사항 커밋 + Push**
```bash
git pull origin main           # 원격 4커밋 먼저 당겨오기
git add eslint.config.js index.html package.json proto2.html src/main.ts vite.config.js src/utils/debugger.ts
git commit -m "feat: add debug HUD, fix parse5 encoding, add check script, fix vite base"
git push origin main
```

**Step 2: Start 버튼 실제 동작 확인 (로컬에서)**
```bash
npm run dev   # vite dev 서버 (base=/) → http://localhost:5173/ 로 접속
```
브라우저 열고 F12 > Console에서:
- `SyntaxError` 있는지 확인
- `typeof window.startGame` 입력 → `"function"` 이어야 함
- Start 버튼 클릭 → 우측 상단 Debug HUD의 `Last Action: CLICK: BUTTON#btn-start` 확인

**Step 3: `/dev/` 채널 배포 구성 (GitHub Actions)**
- `.github/workflows/deploy-dev.yml` 신규 파일 생성
- `dev` 브랜치 push 또는 수동 트리거 시 `dist/` 를 `gh-pages` 브랜치의 `/dev/` 서브폴더로 배포
- 프로덕션 배포는 기존 `deploy.yml` (main 브랜치 push + 스모크 통과 시만) 유지

---

## ⚠️ Known Pitfalls & Rules (반드시 지켜야 할 규칙)

1. **`proto2.html` 직접 수정 금지** — 이 파일은 `index.html`로 리다이렉트하는 스텁. 게임 본체는 `index.html` 수정만.
2. **엔트리 정책**: 게임 개발은 `index.html` + `src/` 만 수정. `proto2.html`은 손대지 말 것.
3. **Start 이벤트 바인딩은 `src/main.ts` 한 곳에서만** — `onclick` 인라인 속성 금지.
4. **배포 전 반드시 `npm run check` 통과** — 이 명령이 실패하면 push 금지.
5. **롤백/복원 작업 전 반드시 커밋** — 체크포인트 없는 `git reset --hard` 금지.

## 🕒 Last Updated
- **일시**: 2026-03-06 20:20 KST
- **로컬 HEAD**: `8676e97` (원격 main보다 뒤처짐, 위 Next Step 1 실행 필요)
