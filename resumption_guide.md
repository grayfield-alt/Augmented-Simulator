# 🌙 프로젝트 대시보드 및 가이드 (Resumption Guide)

이 문서는 본 세션에서 완료된 주요 변경 사항과 다음 세션에서 이어서 진행할 방향을 안내합니다.

## ✅ 이번 세션 완료 사항 (2026-03-03)
1. **버그 수정 (Critical)**:
   - **몬스터 투명화**: `draw` 함수 중복 선언을 통합하여 몬스터 렌더링 문제를 해결했습니다.
   - **UI 중첩/깜빡임**: 증강 선택 및 이벤트 오버레이 시 하단 UI를 강제로 숨겨 충돌을 차단했습니다.
   - **모바일 버튼 가림**: 하단 여백을 `110px`로 확보하여 모바일 브라우저 바 간섭을 제거했습니다.
2. **시인성 및 UI 개선**:
   - **가시성 강화**: 캐릭터 및 몬스터 크기를 **40% 이상(R:42/50)** 확대했습니다.
   - **배치 최적화**: 몬스터들이 화면 중앙으로 더 모이도록(`screenMargin * 0.3`) 배치 로직을 개선했습니다.
   - **조작성 개선**: 패링 버튼을 크게 키우고 테두리 효과를 추가하여 모바일 터치 편의성을 높였습니다.

## 🚀 다음 세션 권장 작업
- [ ] 몬스터 패턴 추가 및 밸런싱 (현재 Proto 사양 기반)
- [ ] 증강(Augment) 효과 추가 구현 및 테스트
- [ ] 사운드 효과 및 추가적인 시각 이펙트(VFX) 보강

---

## 📂 프로젝트 핵심 구조 및 경로

작업 위치를 빠르게 파악하기 위한 주요 파일 시스템 구조입니다.

| **기능 분류** | **파일/폴더 경로** | **핵심 역할** |
| :--- | :--- | :--- |
| **웹 배포 주소** | **[바로가기(Proto2)](https://grayfield-alt.github.io/Augmented-Simulator/proto2.html)** | **GitHub Pages 실시간 배포 경로** |
| **핵심 로직** | [GameEngine.js](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/src/logic/GameEngine.js) | 게임의 핵심 루틴 및 상태 관리 |
| | [constants.js](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/src/logic/constants.js) | 몬스터 데이터, 웨이브 설정 (한글화 완료) |
| **컴포넌트** | [App.jsx](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/src/App.jsx) | 메인 UI 및 렌더링 루프 제어 |
| | [MonsterDebugger.jsx](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/src/components/MonsterDebugger.jsx) | [NEW] 몬스터 상태 모니터링 및 디버깅 도구 |
| **데이터/설정** | [augments.json](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/augments.json) | 증강(Augments) 시스템 데이터 |
| | [vite.config.js](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/vite.config.js) | 웹 배포 및 빌드 설정 |
| **프로토타입** | [proto2.html](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/proto2.html) | 단일 파일 기반 최신 테스트 버전 |
| **지침/문서** | [PROJECT_RULES.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/PROJECT_RULES.md) | 통합된 프로젝트 규칙 및 지침 |
| | [task.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/task.md) | 현재 작업 진행 상황 관리 |

---

## 💡 다음 작업 시 안티그라비티(AI) 필수 수행 절차
새로운 세션을 시작할 때, AI는 반드시 다음 순서로 프로젝트를 파악해야 합니다:

1. **필수 문서 숙지**: 다음 문서들을 최우선으로 읽고 지침을 적용합니다.
   - [PROJECT_RULES.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/PROJECT_RULES.md): 언어, 코딩, 아키텍처 통합 규칙
   - [MONSTERS.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/MONSTERS.md): 몬스터 데이터 규격
   - [AUGMENTS.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/AUGMENTS.md): 증강 상세 스펙

2. **진행 상황 파악**:
   - [task.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/task.md)를 통해 현재 할 일과 완료된 일을 확인합니다.
   - [resumption_guide.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/resumption_guide.md)를 통해 프로젝트 전체 요약을 파악합니다.

> **"Augmented Simulator 프로젝트 작업을 재개할게. [PROJECT_RULES.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/PROJECT_RULES.md), [MONSTERS.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/MONSTERS.md), [AUGMENTS.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/AUGMENTS.md)를 모두 정독하고 나서, [task.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/task.md)의 다음 작업을 진행해줘."**

이 문구 하나면 안티그라비티가 모든 맥락을 이해하고 즉시 작업을 재개할 것입니다.
