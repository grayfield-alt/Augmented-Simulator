# 🚀 Antigravity Handoff Status

## 💬 Agent Start Prompt (한 줄 복붙)
```
집에 왔어. git pull 먼저 해주고 HANDOFF.md 읽고 이어서 작업해줘.
```

## 🏁 Start Checklist (작업 전 확인 사항)
- [ ] `git pull origin main`
- [ ] `npm ci`
- [ ] `npm test` → **반드시 100% 통과** 확인 후 다음 작업 진행

---

## 🕒 Last Updated
- **Time**: 2026-03-06 20:40 (KST)
- **Commit**: 오늘 작업분 push 완료 (see `git log --oneline -5`)

---

## 🎯 Current Goal
**`npm test` 100% 통과 만들기** → 그 다음 Start 버튼 스모크 테스트

---

## 🔴 0순위: 집에서 바로 할 일 (vitest 설정 완료 후 테스트 통과)

### 배경
vitest가 `getInitialGameState is not a function` 에러를 냄. 코드 자체 문제가 아닌 **vitest ESM/SSR import 모드 충돌** 문제임.

오늘 이미 구조 수정 완료:
- ✅ `vitest.config.ts` 신규 생성 (include: `tests/**/*.test.ts`, environment: `node`)
- ✅ `tests/core.test.ts` 경로 수정 (`../src/core/state` 등 올바른 상대경로)
- ✅ `src/tests/` 구버전 폴더 삭제 (혼선 제거)
- ✅ `package.json` → `"test": "vitest run"` 스크립트 추가

### 집에서 바로 실행 순서

**Step 1: 테스트 통과 확인**
```bash
npm test
```
- ✅ 통과하면 → Step 2로
- ❌ 실패하면: `npx vitest run --reporter=verbose` 로 에러 내용 확인

**Step 2: 남은 이슈 - stage.test.ts 경로도 확인**
```bash
# tests/stage.test.ts 에서 import 경로가 ../src/... 형식인지 확인
cat tests/stage.test.ts | head -5
```

**Step 3: 모두 통과하면 Start 버튼 스모크 테스트**
```bash
npm run dev   # http://localhost:5173/ 접속
```
DevTools Console에서:
- `typeof window.startGame` → `"function"` 이어야 함
- Start 클릭 → Debug HUD에 `Last Action: CLICK: BUTTON#btn-start` 표시 확인
- 500ms 내에 게임 시작 안 되면 `Last Error`에 원인 표시됨

---

## ✅ 오늘 완료된 작업 (2026-03-06)
- `index.html` parse5 control-character 오류 완전 제거 (`npm run build` 경고 0)
- `proto2.html` 리다이렉트 스텁으로 고정 (직접 수정 금지)
- `src/utils/debugger.ts` 전역 디버그 HUD 신설
- `src/main.ts` Event Delegation으로 `btn-start`/`btn-archive`/`btn-briefing` 바인딩
- `vite.config.js` 환경별 base 동적 분기 (`serve`=`/`, `build`=`/Augmented-Simulator/`)
- `vitest.config.ts` 생성 및 테스트 구조 단일화 (`tests/` 폴더 단일 진입점)
- `npm run test` + `npm run check` 스크립트 추가

---

## ⏳ Next 3 Steps (내일 집에서)
1. `npm test` 통과 확인 (오늘 구조 수정 반영됐을 것)
2. Start 버튼 스모크: `npm run dev` → F12 → `typeof window.startGame` 확인
3. `/dev/` 프리뷰 채널 분리 배포 구성 (`.github/workflows/deploy-dev.yml` 신규)

---

## ⚠️ 핵심 규칙
1. **`proto2.html` 직접 수정 절대 금지** — 리다이렉트 스텁, 게임 본체는 `index.html`만
2. **Start 이벤트 바인딩은 `src/main.ts` 한 곳에서만** — `onclick` 인라인 금지
3. **배포 전 `npm run check` 통과 필수** (test + lint + build)
4. **테스트 위치는 루트 `tests/` 단일 폴더** — `src/tests/` 다시 만들지 말 것
