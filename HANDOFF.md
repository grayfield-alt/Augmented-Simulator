# 🚀 Antigravity Handoff Status

## 🏁 Start Checklist (작업 전 확인 사항)
- [ ] `git pull origin main` 및 `npm install` 실행 완료
- [ ] 터미널에서 `npm run handoff` 실행하여 Agent Prompt 복사
- [ ] 복사된 Prompt를 Antigravity에게 전송하여 작업 재개

## � Antigravity Agent Start Prompt
`HANDOFF.md 읽고 작업 이어서 해줘.`

---

# 🕒 Last Updated
- **Time**: 2026-03-06 09:45 (KST)
- **Commit**: `feat: restore proto2.html as primary entry and fix encoding` (`b1104de`)

## 🏁 Start Checklist
- [ ] **Company Start Routine** (아래 참고)을 실행하여 개발 환경을 정렬하세요.
- [ ] (선택) `npm run handoff` 스크립트로 최신 상태 브리핑 생성 가능.

## 🎯 Current Goal
- 기존 배포 주소(`proto2.html`) 복구 및 인코딩/스크립트 에러 완전 해결

## ⚠️ 파일 역할 정의 (Priority)
- **`proto2.html` (root)**: 기존 배포 링크 유지를 위한 최우선 엔트리 소스.
- **`public/proto2.html`**: 게임 본체 로직이 포함된 원본 백업/참조용 소스.
- **`index.html` (root)**: 루트 접속 시 `proto2.html`로 즉시 연결하는 리다이렉트 스텁.

## ⏳ Next 3 Steps
1. **GitHub Actions 배포 모니터링**: 
   - `Deploy` 워크플로우 성공 여부 확인.
   - `gh-pages` 브랜치에 최신 커밋(`b1104de`) 반영 여부 확인.
   - 실제 Pages 반영 시간(약 1~2분) 후 사이트 최종 확인.
2. **`index.html` 리다이렉트 검증**: 루트(`/`) 접속 시 `proto2.html`로 정상 이동하는지 확인.
3. **한글 데이터 최종 전수 검사**: 게임 내 모든 텍스트(증강, 몬스터)의 인코딩 상태 최종 점검.

## 🧪 How to Verify (Smoke Check)
- **GitHub Pages 접속 확인**:
  - [/ (index)](https://grayfield-alt.github.io/Augmented-Simulator/) 와 [/proto2.html](https://grayfield-alt.github.io/Augmented-Simulator/proto2.html) 둘 다 접속 가능해야 함.
- **실행 무결성 확인**:
  - **검은 화면**: 접속 시 UI가 즉시 나타나며 배경이 검은색으로만 남지 않는가?
  - **NaN 에러**: 스탯이나 텍스트에 `NaN` 표시가 없는가?
  - **진행 루프**: "START OPERATION" 클릭 후 전투가 3회 이상 정상적으로 이어지는가?

## 🛠️ Company Start Routine
1. `git pull origin main` 실행
2. **Dependency 설치**: `package-lock.json`이 존재하면 `npm ci`, 없으면 `npm install` 실행
3. `npm run dev` 또는 `proto2.html` 로컬 실행으로 정상 작동 확인

---

### 🚨 [주의] 배포 및 수정 규칙
1. **수동 배포 금지**: 모든 배포는 GitHub Actions(`deploy.yml`)를 통해서만 진행합니다.
2. **인코딩 주의**: 한글 수정 시 반드시 **UTF-8 (Plain)** 상태를 유지해야 하며, 깨짐 발견 시 복구 스크립트(`fix_encoding.py`)를 참고하세요.
3. **경로 고정**: `proto2.html`은 절대 삭제하거나 이름을 바꾸지 마세요 (기존 공유 링크 보호).
