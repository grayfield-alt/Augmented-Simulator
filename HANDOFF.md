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
- V3 아키텍처 근본 개선 및 재발 방지 마무리 (데이터 번들링 및 빌드 파이프라인 완성)

## ✅ Done (완료된 작업)
- `src/core/state.ts` 초기 상태 및 스키마 단일화 완료 (핵심 필드 누락 예방)
- `src/core/validator.ts` 상태 무결성 검증기 구현 (NaN 에러 즉각 차단)
- `tests/core.test.ts` 핵심 로직 대상 단위 테스트 10개 구현
- `eslint.config.js`를 통한 `src/core` 내 DOM API(`window`, `document`) 접근 엄격히 차단

## ⏳ Next 3 Steps (다음 진행할 작업 TOP 3)
1. **`src/data` 데이터 번들링 도입**: 런타임 데이터(몬스터, 증강)를 `import` 구조로 연결
2. **로더 셸(Loader Shell) 전환**: 기존 개발용 HTML들을 `/prototypes` 로 격리 보관
3. **UI 에러 투명화 및 배포 스크립트 고도화**: UI `try-catch` 고도화 및 `scripts/sync-dist.js`에 파일 덮어쓰기 로직 보강

## 🧪 How to Verify (검증 방법)
- `npm test`를 실행하여 10개의 코어 테스트가 모두 통과하는지 확인어
- `npm run build:deploy` 시 루트 `proto2.html`이 정상 갱신되고 게임이 로드되는지 브라우저에서 체크

## ⚠️ Known Pitfalls & Rules (주의사항 및 규칙)
- **배포 산출물 격리**: 루트에 위치한 `proto2.html`은 빌더가 덮어쓰는 배포 산출물이므로 **절대 직접(수동) 수정하지 않습니다**. 모든 개발용 HTML은 반드시 `/prototypes` 폴더 내에서만 작업 및 보관합니다.
- **UI 업데이트 안전성**: UI 에러 발생 시 시스템이 정지하지 않게 에러 오버레이에만 표출하고 전투는 계속 진행되게 유지합니다.

## 🕒 Last Updated
- Commit: `feat(v3): implement core validation, state schema, tests, and lint rules`
