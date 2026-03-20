# 한국어 지침 및 클린 아키텍처 스킬 등록 계획

사용자의 요청에 따라 앞으로의 모든 문서(artifacts), 답변, 그리고 코딩 스타일을 다음의 지침에 따라 관리할 것을 제안합니다.

## 사용자 검토 사항

> [!IMPORTANT]
> - 모든 문서(이 계획서, 작업 목록, 결과 보고서 등)와 답변은 이제부터 **한국어**로만 작성됩니다.
> - 모든 코드는 **클린 아키텍처(Clean Architecture)** 원칙을 준수하여 작성됩니다.

## 제안된 변경 사항

### [지침 및 스킬 시스템]

이 섹션에서는 도구가 지침을 자동으로 따를 수 있도록 스킬과 파일을 설정합니다.

---

#### [신규] [skills.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/skills.md)
- 프로젝트 루트에 위치하며, 다음 핵심 지침을 명시합니다:
  - 언어 규정: 모든 답변과 문서(Task, Plan, Walkthrough 등)는 한국어로 작성한다.
  - 코딩 규정: 클린 아키텍처(Clean Architecture) 기반으로 코드를 작성한다 (의존성 규칙, 계층 분리 등).

#### [신규] [SKILL.md](file:///c:/Users/LEE/.gemini/antigravity/scratch/projects/AugmentedSimulator_Main/.agent/skills/clean-architecture/SKILL.md)
- 에이전트가 `clean-architecture` 스킬로 인식할 수 있도록 등록합니다.
- `skills.md`와 동일한 레벨의 강력한 지침을 포함하여 검색 및 적용을 용이하게 합니다.

## 검증 계획

### 자동화 검증
- 생성된 파일들이 지정된 위치(`root`, `.agent/skills/...`)에 존재하는지 확인합니다.
- 파일 내용에 한국어 지침과 클린 아키텍처 관련 내용이 정확히 포함되었는지 확인합니다.

### 수동 검증
- 이후 진행되는 모든 응답과 문서가 한국어로 제공되는지 확인합니다.
- 코드 수정 시 클린 아키텍처의 원칙(예: 비즈니스 로직과 UI의 분리)이 지켜지는지 사용자에게 피드백을 받습니다.
