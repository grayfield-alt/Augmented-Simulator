# Augmented Simulator V3 개편 안내 (한글)

이 프로젝트는 현재 유지보수성 극대화를 위해 **V3 클린 아키텍처**로 개편되었습니다.

## 📂 폴더 구조
- `src/core`: 전투 규칙 및 턴 루프 (DOM 접근 금지)
- `src/ui`: 렌더링, 이벤트 바인드, 선택자(`selectors.ts`)
- `src/app`: 상태 관리(`store.ts`) 및 부팅 로직
- `src/data`: 증강 및 몬스터 런타임 데이터
- `prototypes/`: 구버전(`proto*.html`) 실험장

## 🚀 배포 프로토콜 (GitHub Pages)
GitHub Pages가 리포지토리 루트를 서빙하므로, 다음 명령어를 사용하여 빌드 산출물을 루트로 동기화해야 합니다.

```bash
# 빌드 및 루트(proto2.html 및 assets/) 동기화 (한글)
npm run build:deploy
```

## 🛡️ 안정장치
1. **mustGet 가드**: 필수 DOM 요소 누락 시 즉시 에러 오버레이 노출.
2. **UI 격리**: UI 업데이트 중 에러가 발생해도 Core 전투 루프는 중단되지 않음.
3. **에러 스로틀링**: 동일 에러 반복 발생 시 성능 보호를 위해 오버레이 출력을 제한.

---
모든 공식 배포는 `proto2.html`을 통해 이루어집니다. (한글)
