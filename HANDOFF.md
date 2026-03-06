# 🚀 Antigravity Handoff Status

## 🏁 Start Checklist (작업 전 확인 사항)
- [ ] `git pull origin main` 및 `npm install` 실행 완료
- [ ] 터미널에서 `npm run handoff` 실행하여 Agent Prompt 복사
- [ ] 복사된 Prompt를 Antigravity에게 전송하여 작업 재개

## 💬 Agent Start Prompt
```text
git pull 받았어. 프로젝트 루트에 있는 HANDOFF.md 파일 읽고 하던 작업 이어서 해줘.
```

---

## 🎯 Current Goal (현재 작업 목표)
- 안전한 CI/CD 배포 파이프라인(GitHub Actions) 구축 및 `proto2.html` 소스 격리 보호 적용 완료

## ✅ Done (완료된 작업)
- `src/core/state.ts` 초기 상태 및 스키마 단일화 완료 (핵심 필드 누락 예방)
- `src/core/validator.ts` 상태 무결성 검증기 구현 (NaN 에러 즉각 차단)
- `tests/core.test.ts` 핵심 로직 대상 단위 테스트 10개 구현
- `eslint.config.js`를 통한 `src/core` 내 DOM API(`window`, `document`) 접근 엄격히 차단

## ⏳ Next 3 Steps (다음 진행할 작업 TOP 3)
1. **GitHub Actions 배포 모니터링**: `main` 브랜치 동작 및 `gh-pages` 갱신 정상 동작 점검
2. **`src/data` 데이터 번들링 도입**: 런타임 데이터(몬스터, 증강)를 `import` 구조로 연결
3. **로더 셸(Loader Shell) 전환**: 기존 개발용 HTML들을 `/prototypes` 로 격리 보관

## 🧪 How to Verify (검증 방법)
- 터미널에서 `npm test`를 통과하는지 확인
- **로컬 배포 동작 확인**: `npm run deploy` 실행 시 정상적으로 `gh-pages` 브랜치로 푸시되는지 체크

## ⚠️ Known Pitfalls & Rules (주의사항 및 규칙)

### 🚨 [중요] 배포 구조 및 운영 주의사항
1. **엔트리 포인트 변경**: 이제 게임의 주소는 `.../index.html` (또는 루트 `/`) 입니다. 
2. **proto2.html의 역할**: 최상위 `proto2.html`은 기존 북마크 사용자를 위한 **리다이렉트 전용 스텁**입니다. 실제 게임 본체는 `public/proto2.html`에 있으며, 배포 시 Actions에 의해 `index.html`로 복사됩니다.
3. **수동 수정 금지**: 
   - 루트의 `proto2.html`과 `index.html`은 빌드/배포 시 자동 관리됩니다. 직접 수정하지 마세요.
   - UI나 로직 수정은 오직 `public/proto2.html` 또는 `src/` 폴더 내 소스에서만 진행해야 합니다.
4. **Git 관리**: 루트의 `proto2.html`은 리다이렉트 코드로 고정되어 Git에 추적됩니다. 이를 게임 본문으로 덮어쓰지 않도록 주의하세요 (무한 루프의 원인이 됩니다).
5. **CI/CD 파이프라인**: 모든 배포는 GitHub Actions(`.github/workflows/deploy.yml`)를 통해서만 이루어집니다. `main` 푸시 시 스모크 테스트를 거쳐 자동 배포됩니다.

### 🗺️ [가이드] 스테이지 플랜 수정법
- **위치**: `src/data/stage_plans.ts`
- **수정 방법**: `stagePlans` 객체 내부의 배열 `nodes`에 객체를 추가하거나 수정합니다.
- **Node 타입 규격**:
  - `{ type: 'COMBAT', waveLevel: 1, encounterIds: ['mon_tuto_1'] }` : 단일/다수 몬스터 전투
  - `{ type: 'BOSS', waveLevel: 8, encounterIds: ['mon_boss_1'] }` : 보스 전투 (스테이지 당 최소 1개 필수)
  - `{ type: 'REWARD_AUGMENT' }` : 공통 증강 선택 화면
  - `{ type: 'REST_CHOICE' }` : 체력 회복 등의 휴식 이벤트 화면
- **적용 규칙**: StageRunner가 이 배열을 처음 인덱스부터 끝까지 순차적으로 진행시킵니다.

## 🕒 Last Updated
- Commit: `feat: implement stage loop system with plans and state dispatcher`
