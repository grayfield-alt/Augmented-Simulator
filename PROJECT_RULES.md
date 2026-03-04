# 프로젝트 개발 지침서 (PROJECT RULES)

이 문서는 본 프로젝트 진행 시 AI 코딩 어시스턴트(Antigravity 등) 및 기여자가 항상 최우선으로 준수해야 하는 공통 가이드라인입니다.

## 0. 언어 지침 (Language Policy)
- **모든 답변과 문서는 한글로 작성한다.**
- 사용자 응대, 작업 목록(`task.md`), 구현 계획서(`implementation_plan.md`), 결과 보고서(`walkthrough.md`) 등 모든 산출물에 적용된다.
- 코드 내 주석은 복잡한 로직 설명이 필요한 경우 한글로 작성한다.

## 1. 코드 스타일 (Code Style)
- **모듈 시스템**: 반드시 ES 모듈(`import`/`export`)을 사용하며, CommonJS(`require`)는 금지합니다.
- **문법**: 가능하면 구조 분해 할당(Destructuring assignment)을 적극적으로 사용합니다.
- **타입스크립트**: TypeScript 사용 시 반드시 `strict` 모드를 활성화하고 엄격한 타입 검사를 준수합니다.

## 2. 워크플로우 (Workflow)
- **타입 검사**: 코드 변경 후에는 반드시 `npm run typecheck` 명령어를 실행하여 타입 오류가 없는지 확인합니다.
- **테스트 실행**: 전체 테스트 스위트를 실행하지 말고, 관련된 단일 테스트만 실행합니다. (예: `npm test -- path/to/test`)
- **TDD 기반**: **[중요]** 항상 기능 구현 전에 테스트(Test)를 먼저 작성해야 합니다.

## 3. Git 컨벤션 (Git Conventions)
- **브랜치 네이밍**: 브랜치 생성 시 `feature/[작업명]` 또는 `fix/[이슈번호]` 형식을 따릅니다.
- **커밋 메시지**: 컨벤셔널 커밋(Conventional Commits) 규약을 준수합니다. (예: `feat:`, `fix:`, `docs:`, `refactor:`)
- **강제 푸시**: `main` 브랜치에 어떠한 경우에도 강제 푸시(Force Push, `-f`)를 금지합니다.

## 4. 백엔드 및 기타 주의사항
- **인증(Auth)**: `auth` 미들웨어는 `passport`가 `req.user`를 정상적으로 설정해야만 동작합니다.
- **데이터베이스**: DB 마이그레이션 작업은 반드시 `npm run migrate` 명령어를 통해서만 실행합니다.

---

## 6. 아키텍처 및 코딩 규정 (Architecture & Coding Policy)
이 프로젝트는 **클린 아키텍처(Clean Architecture)** 기반으로 코딩하며, 다음 원칙을 엄격히 준수합니다.

- **의존성 규칙(Dependency Rule)**: 고수준 정책(비즈니스 로직)은 저수준 세부사항(UI, 데이터베이스 등)에 의존하지 않아야 합니다.
- **계층 분리**:
  - **Entities**: 핵심 비즈니스 모델 및 규칙 (`src/logic/` 내 핵심 엔티티)
  - **Use Cases**: 애플리케이션 특정 비즈니스 로직
  - **Interface Adapters**: 컨트롤러, 프레젠터, 게이트웨이
  - **Frameworks & Drivers**: UI(React/HTML), 외부 API, 라이브러리 (Vite, Tailwind 등)
- **관심사 분리(Separation of Concerns)**: 각 모듈과 클래스는 하나의 책임만 가집니다.
- **명확한 인터페이스**: 컴포넌트 간 통신은 정의된 인터페이스를 통해 이루어져야 합니다.
