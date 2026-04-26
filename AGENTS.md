# AGENTS.md

## 프로젝트

이 프로젝트는 TypeScript 학습용 DB 부하 테스트 및 모니터링 서비스입니다.

코드는 작고 읽기 쉽게 유지합니다. TypeScript, Express, ESM 동작을 이해하기 쉬운 방향을 우선합니다.

## 명령어

- 빌드: `npm run build`
- 개발 서버: `npm run dev`
- 빌드 결과 실행: `npm start`

TypeScript 코드를 수정한 뒤에는 가능하면 `npm run build`로 확인합니다.

## TypeScript 규칙

- 이 프로젝트는 ESM과 `module: "NodeNext"`를 사용합니다.
- 로컬 파일 import에는 TypeScript 파일을 가져오더라도 `.js` 확장자를 씁니다.

```ts
import workerRouter from './worker.js';
```

- 타입으로만 쓰는 import는 `import type`을 우선합니다.

```ts
import { Router, type Request, type Response } from 'express';
```

- 정해진 문자열 값은 literal union type 또는 `as const` 객체를 사용합니다.
- 특정 문자열 값만 허용하려면 `: string`을 붙여 타입을 넓히지 않습니다.

## 구조

- `src/index.ts`: Express 앱 설정과 서버 시작
- `src/routes`: HTTP 라우팅 연결
- `src/worker`: worker와 worker manager의 핵심 로직

코드가 커지면 라우팅과 핵심 로직을 분리합니다.

- route 파일은 URL과 HTTP method를 연결합니다.
- worker 파일은 worker 상태와 동작을 관리합니다.

## 스타일

- class 내부는 필드, constructor, public method, private method 순서로 둡니다.
- class 상태에 의존하는 보조 로직은 private method로 둡니다.
- `this`가 필요 없는 보조 로직은 class 밖의 일반 함수로 둡니다.
- 사용하지 않는 Express request 인자는 `_req`처럼 표시합니다.
- 주석은 짧고 필요한 경우에만 작성합니다.

## Git

- 관련 없는 사용자 변경사항을 되돌리지 않습니다.
- 현재 작업에 필요하지 않은 큰 리팩터링은 피합니다.
