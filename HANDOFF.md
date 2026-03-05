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

### 🚨 [중요] 배포 산출물 격리 및 병합 충돌 대응
1. **수정 엄금**: 최상단 `proto2.html` 파일은 GitHub Actions 봇에 의해 생성되는 **빌드 산출물**입니다. **절대 직접(수동) 수정하거나 에디터로 열어서 덮어쓰지 마세요.**
2. **Git 추적 제외**: `proto2.html`은 `.gitignore`에 등록되어 있습니다. 만약 실수로 해당 파일이 Staging Area에 들어간 경우 `git restore --staged proto2.html` 명령어로 빼내야 합니다.
3. **병합 충돌 시(Merge Conflict)**:
   - Git Pull 도중 충돌이 발생하면, **기존의 구버전 HTML을 덮어쓰는 `--theirs`를 함부로 사용하지 마세요.**
   - 개발 및 UI 수정은 `src/` 나 `.tsx`/`.html` 소스 파일에서만 진행해야 합니다. 
   - `proto2.html`은 사람이 편집 대상에서 제외시켰으므로 이 파일의 충돌은 무시/삭제 처리하거나 빌드를 통해 재생성합니다.
4. **CI/CD 파이프라인**: 모든 정식 배포는 `main` 브랜치에 코드가 푸시될 때 GitHub Actions (`.github/workflows/deploy.yml`)가 자동으로 빌드 후 `gh-pages` 브랜치에 덮어씁니다.

## 🕒 Last Updated
- Commit: `feat: Establish safe deployment pipeline and isolate proto2.html`
