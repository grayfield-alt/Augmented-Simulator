# 🚀 Antigravity Handoff Status

현재 진행 중인 작업과 다음 목표를 기록한 문서입니다. Antigravity가 이 문서를 읽으면 바로 문맥을 파악하고 작업을 이어나갈 수 있습니다.

## 📝 현재 작업 목표
- V3 아키텍처 근본 개선 및 재발 방지 (NaN 버그 해결 후속 조치)

## ✅ 방금 완료된 작업 (V3 Core 무결성 강화)
- `src/core/state.ts` 초기 상태 및 스키마 단일화 (핵심 필드 누락 예방)
- `src/core/validator.ts` 상태 무결성 검증기 구현 (NaN 및 논리 오류 즉각 차단)
- `tests/core.test.ts` 턴 시작 AP, 패링 보상, 데미지 유효성 등 핵심 단위 테스트 10개 구현 완료
- `eslint.config.js`를 통해 `src/core` 내 DOM API(`window`, `document`) 접근 엄격히 차단

## ⏳ 다음 진행할 작업 (Next Steps)
집에서 이 문서를 읽고 아래 항목들부터 바로 순차적으로 진행하면 됩니다.
1. **`src/data` 데이터 번들링 도입**: 런타임 데이터(몬스터, 증강)를 `import` 구조로 연결하여 경로/캐시 이슈 방지
2. **로더 셸(Loader Shell) 전환**: 기존 개발용 HTML들을 `/prototypes` 폴더로 격리하고, 루트 `proto2.html`은 순수 배포용 로더로 취급
3. **UI 에러 투명성 확보**: UI 업데이트 스킵 시 오버레이 노출 및 콘솔 출력 강제 (+ 반복 에러 스로틀 패턴)
4. **배포 동기화 스크립트 고도화**: `scripts/sync-dist.js`에 `/assets` 클리닝 로직 추가 및 `proto2.html` 덮어쓰기 로직 보강

## 💡 Antigravity Agent Instructions (시스템 지시어)
1. 이 문서를 인지한 즉시 **"다음 진행할 작업"**의 1번부터 이어서 기획을 수립하고 모드를 전환하세요.
2. 불필요한 중복 확인을 피하고 곧바로 구현 계획과 코딩 단계로 넘어가세요.
