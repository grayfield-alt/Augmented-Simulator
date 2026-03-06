# 🛠️ 배포 파이프라인 복구 및 리다이렉트 루프 해결 완료

이번 작업으로 GitHub Pages에서 발생하던 무한 리다이렉트 루프 및 검은 화면 문제를 근본적으로 해결했습니다.

## 📋 핵심 변경 사항

### 1. 배포 엔트리 포인트 최적화
- **`index.html` (게임 본체)**: 빌드/배포 시 `public/proto2.html`의 내용이 자동으로 `index.html`로 복사되어 주 엔트리 포인트가 됩니다.
- **`proto2.html` (리다이렉트 스텁)**: 최상위 `proto2.html`은 이제 1~2줄의 고정 리다이렉트 코드로만 구성됩니다. 이는 기존 사용자를 `index.html`로 안내하는 역할을 하며, 다시 자기 자신을 부르는 사고를 방지합니다.

### 2. GitHub Actions (CI/CD) 강화
- `.github/workflows/deploy.yml`을 수정하여 **index.html-to-game** 구조를 강제화했습니다.
- **스모크 테스트(`Smoke Check`) 추가**: 배포 전 소스(`public/proto2.html`)와 배포 대상(`_deploy/index.html`)에 필수 DOM(`gameCanvas`, `lobby-overlay` 등)이 있는지 검증하며, 이상 발견 시 자동 배포를 중단합니다.

### 3. 운영 수칙 명시
- `HANDOFF.md`를 통해 사람이 직접 루트의 `proto2.html`이나 `index.html`을 수정하지 않도록 지침을 마련했습니다.

## 🧪 검증 결과
- **리다이렉트 검증**: `.../proto2.html` 접속 시 자동으로 `.../index.html`로 리다이렉트됨을 확인했습니다.
- **루프 해결**: 자기 자신을 무한히 호출하던 현상이 사라졌습니다.
- **CI 동작**: 모든 배포 단계가 GitHub Actions에서 `success`로 통과함을 확인했습니다.

> [!IMPORTANT]
> **사용자 조치 필요**: 현재 저장소 설정이 `main` 브랜치를 서빙 중이라면, **GitHub Settings -> Pages**에서 소스 브랜치를 **`gh-pages`**로 변경해 주세요. (Actions가 해당 브랜치에 신규 구조를 푸시해 둔 상태입니다.)
