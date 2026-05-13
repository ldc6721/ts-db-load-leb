# AGENTS.md

## 프로젝트

이 프로젝트는 TypeScript 학습용 DB 부하 테스트 및 모니터링 서비스입니다.

장기 목표는 API 요청으로 PostgreSQL 테스트 환경을 준비하고, 정해진 부하 시나리오를 실행한 뒤 TPS, latency, error rate를 리포팅하는 서비스입니다.

현재 단계에서는 고정 PostgreSQL DB를 대상으로 worker thread 기반 insert 부하를 발생시키고, 실행 상태와 적재 결과를 관찰하는 데 집중합니다.

코드는 작고 읽기 쉽게 유지합니다. TypeScript, Express, ESM 동작을 이해하기 쉬운 방향을 우선합니다.

## 제품 방향

- 핵심 도메인은 "DB 부하 테스트 실행(run)"입니다.
- worker manager 하나는 부하 테스트 실행 1회로 생각합니다.
- 추후 네이밍을 정리할 때는 `WorkerManager`보다 `LoadTestRun`, `workerManagerId`보다 `runId`, `group_id`보다 `run_id` 같은 목적 중심 이름을 우선 고려합니다.
- 부하 발생 자체보다 측정과 비교가 중요합니다.
- 우선순위는 고정 DB 부하 테스트, run 단위 리포트, 시나리오 분리, Docker 기반 DB 환경 생성, 여러 DB 버전/설정 비교 순서입니다.

## 성능 테스트 지표

성능 테스트 기능을 확장할 때는 다음 지표를 우선 고려합니다.

- 총 요청 수 또는 총 insert 수
- 성공 수와 실패 수
- TPS 또는 초당 insert 수
- 평균 latency
- min, max, p95 latency
- 시작 시간, 종료 시간, elapsed time
- error message 또는 실패 원인

부하 시나리오 옵션은 단계적으로 추가합니다.

- `numWorkers`: 동시 worker 수
- `duration`: 실행 시간
- `intervalMs`: insert 간격
- `batchSize`: 한 번에 insert할 row 수
- `payloadSize`: row 크기
- `mode`: `insert-only`, `read-only`, `mixed`

## 환경 구성 방향

- 초기 단계에서는 `.env`와 docker-compose로 고정 PostgreSQL에 연결합니다.
- 이후에는 API로 PostgreSQL 테스트 환경을 생성하고, 해당 환경에 대해 부하 테스트를 실행하는 구조를 목표로 합니다.
- Docker 기반 환경 생성은 부하 테스트 리포트 모델이 먼저 정리된 뒤 붙입니다.
- Docker/PostgreSQL 버전, CPU/memory 옵션, init SQL 같은 환경 설정은 리포트에 함께 남기는 방향을 선호합니다.

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
- `src/database`: DB 연결과 쿼리 실행 로직

코드가 커지면 라우팅과 핵심 로직을 분리합니다.

- route 파일은 URL과 HTTP method를 연결합니다.
- worker 파일은 worker 상태와 동작을 관리합니다.
- database 파일은 SQL 실행과 DB별 분기를 관리합니다.
- 리포트, 실행 기록, 환경 관리가 커지면 route와 핵심 로직을 분리합니다.

## 스타일

- class 내부는 필드, constructor, public method, private method 순서로 둡니다.
- class 상태에 의존하는 보조 로직은 private method로 둡니다.
- `this`가 필요 없는 보조 로직은 class 밖의 일반 함수로 둡니다.
- 사용하지 않는 Express request 인자는 `_req`처럼 표시합니다.
- 주석은 짧고 필요한 경우에만 작성합니다.

## Git

- 관련 없는 사용자 변경사항을 되돌리지 않습니다.
- 현재 작업에 필요하지 않은 큰 리팩터링은 피합니다.
