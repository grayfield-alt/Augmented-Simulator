# 프로젝트 지침 (Project Instructions)

이 파일은 프로젝트의 핵심 지침을 담고 있으며, 에이전트가 작업을 수행할 때 반드시 준수해야 합니다.

## 1. 언어 규정 (Language Policy)

- **모든 문서와 답변은 한국어로 작성한다.**
- 여기에는 다음이 포함됩니다:
  - 사용자 응대 및 답변
  - `task.md` (작업 목록)
  - `implementation_plan.md` (구현 계획서)
  - `walkthrough.md` (결과 보고서)
  - 프로젝트 내의 기술 문서 및 가이드 (.md 파일)
  - 주석 (코드 내의 복잡한 로직 설명 시)

## 2. 코딩 규정 (Coding Policy)

- **클린 아키텍처(Clean Architecture) 기반으로 코딩한다.**
- **의존성 규칙(Dependency Rule)**: 고수준 정책(비즈니스 로직)은 저수준 세부사항(UI, 데이터베이스 등)에 의존하지 않아야 한다.
- **계층 분리**:
  - **Entities**: 핵심 비즈니스 모델 및 규칙
  - **Use Cases**: 애플리케이션 특정 비즈니스 로직
  - **Interface Adapters**: 컨트롤러, 프레젠터, 게이트웨이
  - **Frameworks & Drivers**: UI(React/HTML), DB, 외부 API
- **관심사 분리(Separation of Concerns)**: 각 모듈과 클래스는 하나의 책임만 가진다.
- **명확한 인터페이스**: 컴포넌트 간 통신은 정의된 인터페이스를 통해 이루어진다.

## 3. 문서화 규정 (Documentation Policy)

- 기존의 모든 영어 문서는 순차적으로 한국어로 재작성하거나 번역한다.
- 새로운 문서를 생성할 때는 반드시 한국어를 사용한다.
