# Augmented Simulator - 집에서 작업 이어하기 가이드

현재 `augmented_simulator` 프로젝트의 작업 상태와 집에 가서 이어서 하는 방법을 안내해 드립니다.

## 1. 현재 대화 정보
- **Conversation ID**: `4fc72d59-0275-4075-9a2e-e8df240ce6c2`
- **현재 진행 상태**:
    - 전투 메커니즘 (`combat.js`) 및 시뮬레이터 연동 완료.
    - 증강(Augments) 시스템 (`augments.js`, `augments.json`) 구현.
    - 드래곤 보스 패턴 및 엔진 통합 문서 작성 완료.

## 2. 집에서 이어서 하는 방법
집에서 Antigravity를 실행한 후 다음 단계를 따라주세요.

### Step 1: 저장소 클론
```bash
git clone https://github.com/grayfield-alt/Augmented-Simulator.git
cd Augmented-Simulator
```

### Step 2: AI에게 맥락 제공하기
새 대화를 시작할 때 다음 메시지를 복사해서 입력해 주세요:

> "기존 대화(`4fc72d59-0275-4075-9a2e-e8df240ce6c2`)에서 진행하던 증강 시뮬레이터 작업을 이어서 하고 싶어. 현재 `augmented_simulator` 폴더를 워크스페이스로 설정해줘. Git에서 최신 코드를 받았으니, `task.md`와 `implementation_plan.md`를 참고해서 다음 단계를 알려줘. UI 안정화와 **Stage 7 고대 드래곤**까지 구현된 상태야."

## 3. 주요 파일 위치
- 핵심 로직: `simulator.js`, `combat.js`, `augments.js`
- 데이터: `augments.json`, `patterns.json`
- 기술 문서: `engine_integration.md`

이 가이드는 `resumption_guide.md` 파일로 프로젝트 루트에 저장되어 있습니다.
