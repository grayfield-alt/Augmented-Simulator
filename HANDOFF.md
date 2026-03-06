# 🚀 Antigravity Handoff Status

## 🏁 Start Checklist (작업 전 확인 사항)
- [ ] `git pull origin main` 및 `npm install` 실행 완료
- [ ] 터미널에서 `npm run handoff` 실행하여 Agent Prompt 복사
- [ ] 복사된 Prompt를 Antigravity에게 전송하여 작업 재개

## 💬 Agent Start Prompt (한 줄 복붙)
```
git pull 받았어. 프로젝트 루트에 있는 HANDOFF.md 파일 읽고 하던 작업 이어서 해줘.
```

---

## 🕒 Last Updated
- **Time**: 2026-03-06 20:30 (KST)
- **Commit**: `f6f39d7` chore: debug HUD + parse5 fix + check script + handoff

## 🎯 Current Goal
- Start 버튼이 항상 안정적으로 동작하도록 핵심 기반 구축
- `/dev/` 프리뷰 채널 분리 배포 구성

## ⚠️ 파일 역할 정의 (Priority)
- **`index.html` (root)**: 실행 엔트리. 게임 본체 코드 포함 + V3 모듈(`src/main.ts`) 로드.
- **`proto2.html` (root)**: 기존 공유 링크 보호용 **리다이렉트 스텁 전용**. 직접 수정 금지.
- **`src/utils/debugger.ts`**: 전역 디버그 HUD (Start Bind/inputLocked/LastError 실시간 표시).

## ✅ 오늘 완료된 작업
- `index.html` parse5 control-character 오류 완전 제거 (`npm run build` 경고 0)
- `proto2.html` 리다이렉트 스텁으로 고정 (직접 수정 금지 정책 적용)
- `src/utils/debugger.ts` 전역 디버그 HUD 신설:
  - Start Bind OK/NO, inputLocked, lastAction, lastError 실시간 표시
  - Start 클릭 후 500ms 내 RUNNING 미전환 시 원인 자동 출력
  - `window.onerror` + `unhandledrejection` → 화면 오버레이 표시
- `src/main.ts` Event Delegation으로 `btn-start`/`btn-archive`/`btn-briefing` 바인딩
- `vite.config.js` 환경별 base 동적 분기 (`serve`=`/`, `build`=`/Augmented-Simulator/`)
- `package.json` `npm run check` (lint+build) 파이프라인 추가

## ⏳ Next 3 Steps

### Step 1: Start 버튼 실제 동작 확인 (로컬)
```bash
npm run dev    # http://localhost:5173/ 접속
```
DevTools Console에서:
- `SyntaxError` 여부 확인
- `typeof window.startGame` → `"function"` 이어야 함
- Start 클릭 후 우측 상단 Debug HUD에서 `Last Action: CLICK: BUTTON#btn-start` 확인

### Step 2: `/dev/` 프리뷰 채널 배포 구성
```
파일: .github/workflows/deploy-dev.yml 신규 생성
- dev 브랜치 push 또는 수동 트리거 시
- dist/ 내용을 gh-pages 브랜치의 /dev/ 서브폴더로 배포
- vite build 시 base: '/Augmented-Simulator/dev/' 로 별도 설정
```

### Step 3: 프로덕션 스모크 테스트 자동화
```
scripts/smoke-check.js 에서 Start → 전투 3턴 응답 확인 로직 추가
npm run deploy 파이프라인에 연동
```

## 🧪 How to Verify (Smoke Check)
```bash
npm run dev                     # 로컬에서 Start 버튼 동작 확인
npm run check                   # lint + build 통과 여부
```
- GitHub Pages: https://grayfield-alt.github.io/Augmented-Simulator/proto2.html 접속 후 Start 클릭

## 🛠️ Company Start Routine
1. `git pull origin main`
2. `npm ci` (또는 `npm install`)
3. `npm run check` 통과 확인
4. `npm run dev` 로컬 테스트

---

### 🚨 [주의] 배포 및 수정 규칙
1. **수동 배포 금지**: 모든 배포는 GitHub Actions(`deploy.yml`)를 통해서만 진행.
2. **`proto2.html` 직접 수정 절대 금지**: 리다이렉트 스텁으로 고정. 게임 본체는 `index.html`만 수정.
3. **Start 이벤트 바인딩은 `src/main.ts` 한 곳에서만**: `onclick` 인라인 속성 금지.
4. **배포 전 반드시 `npm run check` 통과**: 이 명령이 실패하면 push 금지.
5. **인코딩 주의**: 한글 수정 시 반드시 UTF-8 (BOM 없음) 저장. 깨진 문자(`?` 박스) 발견 시 Node 정규식으로 제거.
