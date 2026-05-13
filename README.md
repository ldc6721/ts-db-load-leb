# ts-db-load-lab

TypeScript 기반 PostgreSQL 부하 테스트 및 리포팅 서비스입니다.

현재는 고정 PostgreSQL DB를 대상으로 worker thread가 insert 부하를 발생시키고, 실행 상태와 적재 결과를 API로 확인하는 단계입니다. 장기적으로는 API 요청으로 테스트용 PostgreSQL 환경을 생성하고, 지정한 시나리오를 일정 시간 실행한 뒤 TPS, latency, error rate를 리포팅하는 앱을 목표로 합니다.

## 목표

- PostgreSQL에 동시 쓰기 부하를 발생시킨다.
- worker 수와 실행 시간에 따른 처리량 변화를 관찰한다.
- 부하 테스트 실행 단위로 결과를 기록하고 비교할 수 있게 만든다.
- 추후 Docker 기반 PostgreSQL 테스트 환경을 API로 생성하고 정리한다.
- TypeScript, Express, ESM, worker thread, DB connection pool을 학습하기 쉬운 구조로 유지한다.

## 현재 기능

- Express 기반 API 서버
- PostgreSQL 연결
- worker thread 기반 insert 부하 발생
- worker manager 생성, 시작, 중지, 정리
- group 단위 샘플 데이터 분포 조회
- 서버 시작 시 이전 샘플 데이터 정리

## 목표 기능

- run 단위 부하 테스트 기록
- 총 insert 수, 성공 수, 실패 수 집계
- TPS 또는 초당 insert 수 계산
- 평균, min, max, p95 latency 계산
- error message와 실패 원인 기록
- 시간대별 TPS 그래프용 API
- 부하 시나리오 옵션 분리
- Docker 기반 PostgreSQL 테스트 환경 생성
- PostgreSQL 버전과 설정별 성능 비교 리포트

## 부하 테스트 시나리오 옵션

초기에는 `numWorkers`와 `duration` 중심으로 실행합니다. 이후 다음 옵션을 단계적으로 추가할 예정입니다.

- `numWorkers`: 동시 worker 수
- `duration`: 실행 시간
- `intervalMs`: insert 간격
- `batchSize`: 한 번에 insert할 row 수
- `payloadSize`: row 크기
- `mode`: `insert-only`, `read-only`, `mixed`

## 기술 스택

- Node.js
- TypeScript
- Express
- PostgreSQL
- Docker

## 실행

```bash
npm install
npm run dev
```

빌드 후 실행:

```bash
npm run build
npm start
```

Docker Compose:

```bash
npm run docker:up
npm run docker:down
```

## 프로젝트 구조

```txt
src/index.ts          Express 앱 설정과 서버 시작
src/routes            HTTP 라우팅
src/worker            worker thread와 worker manager 로직
src/database          DB 연결과 쿼리 실행 로직
public                간단한 정적 화면
docker                DB 초기화 등 Docker 관련 파일
```

## License

MIT License
