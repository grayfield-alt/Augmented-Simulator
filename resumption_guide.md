# 증강 시뮬레이터 - 작업 재개 가이드 (한글판)

이 가이드는 `augmented_simulator` 프로젝트의 현재 상태와 다른 환경에서 작업을 이어서 하는 방법을 안내합니다.

## 1. 현재 개발 상태
- **전투 메커니즘**: `CombatEngine.js`를 통한 통합 완료.
- **증강 시스템**: `augments.js` 및 `augments.json` 구현 완료.
- **몬스터 데이터**: `constants.js` 내의 `WAVE_DATA` 및 `patterns.json` 한글화 완료.
- **아키텍처**: 클린 아키텍처 기반의 코드 구조 형성 및 지침 등록 완료.

## 2. 작업 이어서 하기
새로운 환경에서 Antigravity를 실행한 후 다음 단계를 따르세요.

### 1단계: 저장소 가져오기
```bash
git clone https://github.com/grayfield-alt/Augmented-Simulator.git
cd Augmented-Simulator
```

### 2단계: AI에게 맥락 제공
새 대화를 시작할 때 다음 메시지를 복사하여 입력해 주세요:

> "기존 대화에서 진행하던 증강 시뮬레이터 작업을 이어서 하고 싶어. 현재 프로젝트의 `skills.md`와 `task.md`를 먼저 읽고, 모든 답변과 문서를 한국어로 작성해줘. 클린 아키텍처 지침을 준수하며 다음 단계를 제안해줘."

## 3. 주요 파일 위치
- **핵심 로직**: `src/logic/GameEngine.js`, `src/logic/CombatEngine.js`
- **데이터 설정**: `src/logic/constants.js`, `augments.json`, `patterns.json`
- **지침 문서**: `skills.md`, `README.md`, `engine_integration.md`

이 가이드는 `resumption_guide.md` 파일로 프로젝트 루트에 저장되어 있습니다.
