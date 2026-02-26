---
description: 어떻게 집에서 Antigravity와 함께 개발을 이어갈 수 있나요?
---

# 집에서 개발 이어가기 (Handoff Workflow)

이 프로젝트는 현재 Git 저장소에 모든 변경 사항이 푸시되어 있습니다. 집에서 다시 시작하실 때 다음 단계를 따라주시면 Antigravity가 문맥을 완벽히 파악하여 이어서 작업할 수 있습니다.

## 1. 프로젝트 복제 (Clone)
집에 있는 PC의 터미널(PowerShell 또는 CMD)에서 작업을 원하는 폴더로 이동한 뒤 다음 명령어를 입력하세요:
```powershell
git clone <현재_리포지토리_URL>
cd augmented_simulator_web
```

## 2. Antigravity에게 첫 번째 메시지 보내기
프로젝트 폴더를 여신 후, Antigravity에게 다음과 같이 요청하세요:
> "이 프로젝트의 현재 상태를 파악해줘. 최근에 `Augmented_Simulator_Ultimate.html`이라는 단일 파일 버전의 전투 루프를 고도화했고, 몬스터 어택 스피드 밸런스와 유저 조준 시스템을 수정했어. `task.md`와 `walkthrough.md`를 참고해서 다음 작업을 제안해줘."

## 3. 작업 환경 확인
- **단일 파일 버전**: `Augmented_Simulator_Ultimate.html`을 브라우저로 열어 즉시 테스트할 수 있습니다.
- **웹 개발 모드**: `npm install` 후 `npm run dev`를 실행하여 React 기반 환경에서도 작업이 가능합니다.

## 4. 진행 상황 추적
`brain` 폴더 내의 `task.md`와 `walkthrough.md`는 Antigravity가 작업 기록을 기억하는 핵심 문서입니다. 집에서도 이 파일들을 먼저 읽게 하면 작업의 연속성이 유지됩니다.
