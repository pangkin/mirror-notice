# Pangkin Mirror 공지사항 페이지

Node.js와 Express를 활용하여 마크다운 파일로부터 공지사항을 읽어와 표시하는 웹 페이지입니다.

## 특징

- 📝 **마크다운 기반**: 공지사항을 마크다운 형식으로 작성
- 🎨 **일관된 디자인**: main-ko.html의 디자인 스타일 적용
- 🔄 **자동 변환**: 마크다운을 HTML로 자동 변환
- 📊 **메타데이터 지원**: Front Matter로 제목, 날짜, 우선순위 등 관리
- 🚀 **실시간 업데이트**: 마크다운 파일 추가/수정 시 자동 반영

## 설치 방법

```bash
# 의존성 패키지 설치
npm install

# Tailwind CSS 빌드
npm run build:css
```

## 실행 방법

```bash
# 서버 시작 (CSS 자동 빌드 포함)
npm start

# 개발 모드 (자동 재시작)
npm run dev

# Tailwind CSS만 빌드
npm run build:css

# Tailwind CSS 실시간 감시 모드
npm run watch:css
```

서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속하세요.

## 디렉토리 구조

```
notice/
├── server.js              # Express 서버
├── notice.html            # 공지사항 페이지 HTML
├── package.json           # 프로젝트 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── src/
│   └── input.css          # Tailwind CSS 소스
├── public/                # 정적 파일 (빌드된 CSS)
│   └── tailwind.css       # 빌드된 Tailwind CSS
└── notices/               # 마크다운 공지사항 파일들
    ├── 2025-10-29-maintenance.md
    ├── 2025-10-25-new-mirror.md
    └── 2025-10-20-welcome.md
```

## 공지사항 작성 방법

`notices/` 디렉토리에 `.md` 파일을 생성하고 다음 형식으로 작성하세요:

```markdown
---
title: 공지사항 제목
date: 2025-10-29
author: 관리자
priority: high
status: scheduled
---

# 공지사항 제목

여기에 공지사항 내용을 마크다운 형식으로 작성합니다.

## 섹션 제목

- 목록 항목 1
- 목록 항목 2

코드 블록도 사용 가능합니다:

\`\`\`bash
npm install
\`\`\`
```

### Front Matter 속성

- `title`: 공지사항 제목 (필수)
- `date`: 작성 날짜 (YYYY-MM-DD 형식)
- `author`: 작성자 (기본값: 관리자)
- `priority`: 우선순위
  - `high`: 중요 (빨간색 배지)
  - `normal`: 일반 (파란색 배지)
  - `low`: 참고 (회색 배지)
- `status`: 진행 상태 (기본값: completed)
  - `scheduled`: 예정 (주황색 배지) - 점검, 업데이트 등이 예정된 경우
  - `ongoing`: 진행 중 (녹색 배지, 애니메이션) - 현재 진행 중인 작업
  - `completed`: 완료 (회색 배지) - 완료되었거나 일반 안내사항

### 상태(status) 사용 예시

**점검 예정:**

```markdown
---
title: 서비스 점검 안내
status: scheduled
---
```

**점검 진행 중:**

```markdown
---
title: 서비스 점검 안내
status: ongoing
---
```

**점검 완료:**

```markdown
---
title: 서비스 점검 안내
status: completed
---
```

## API 엔드포인트

- `GET /`: 공지사항 페이지
- `GET /api/notices`: 모든 공지사항 목록 (JSON)
- `GET /api/notices/:filename`: 특정 공지사항 조회 (JSON)

## 기술 스택

- **Node.js**: JavaScript 런타임
- **Express**: 웹 프레임워크
- **Marked**: 마크다운 파서
- **Gray-Matter**: Front Matter 파서
- **Tailwind CSS v3**: 유틸리티 우선 CSS 프레임워크
- **Pretendard**: 한글 폰트

## 커스터마이징

### 스타일 수정

`notice.html` 파일의 `<style>` 태그 내에서 CSS를 수정할 수 있습니다.

### 포트 변경

환경 변수로 포트를 지정할 수 있습니다:

```bash
PORT=8080 npm start
```

## 라이선스

ISC
