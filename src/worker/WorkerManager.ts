import { randomUUID } from 'node:crypto';
import { WorkerManagerStatus, WorkerManagerInfo } from './types.js';
import DbLoadWorker from './DbLoadWorekr.js'

class WorkerManager {
    id: string;
    workers: DbLoadWorker[] = [];
    numWorkers: number;
    dbName: string;
    status: WorkerManagerStatus;
    durationMs: number;
    elapsedTime: number;
    accessTime: Date;
    startedAt: Date | null;

    /**
     * worker process
     * @param numWorkers 
     * @param dbName 
     */
    constructor(numWorkers: number, dbName: string, duration: number = 10) {
        this.id = randomUUID();
        this.workers = [];
        this.numWorkers = numWorkers;
        this.dbName = dbName;
        this.status = WorkerManagerStatus.READY;
        this.durationMs = duration * 1000; // duration을 밀리초 단위로 변환
        this.elapsedTime = 0;
        this.accessTime = new Date();
        this.startedAt = null;

        // create worker
        this.createWorkers();
    }

    // public methods
    /**
     * start all 
     */
    start: () => void = () => {
        if (this.status === WorkerManagerStatus.RUNNING) {
            // 이미 실행 중인 경우, 중복 실행 방지
            return;
        }

        this.elapsedTime = 0;
        this.startedAt = new Date();
        this.refreshAccessTime();

        // worker start
        for (const worker of this.workers) {
            worker.start();
        }

        // worker 상태 업데이트
        this.status = WorkerManagerStatus.RUNNING;
    }

    /**
     * stop all
     */
    stop: () => void = () => {
        this.refreshAccessTime();

        if (this.status !== WorkerManagerStatus.RUNNING) {
            return;
        }

        this.refreshElapsedTime();

        // worker stop
        for (const worker of this.workers) {
            worker.stop();
        }

        // worker 상태 업데이트
        this.status = WorkerManagerStatus.STOPPED;
        this.startedAt = null;
    }

    /**
     * update worker
     */
    update: (numWorkers: number, dbName: string, duration: number) => void = (numWorkers: number, dbName: string, duration: number) => {
        this.refreshAccessTime();

        // worker 정보 업데이트 전, 기존 worker가 존재한다면 리소스 정리
        if (this.workers.length > 0) {
            this.stop();
            this.clean();
        }

        // worker 정보 업데이트
        this.numWorkers = numWorkers;
        this.dbName = dbName;
        this.durationMs = duration * 1000; // duration을 밀리초 단위로 변환
        this.elapsedTime = 0;
        this.startedAt = null;
        this.status = WorkerManagerStatus.READY;

        // worker 재생성
        this.createWorkers();
    }

    /**
     * clean all worker resources
     */
    clean: () => void = () => {
        this.refreshAccessTime();

        for (const worker of this.workers) {
            // worker 리소스 정리
            worker.clean();
        }

        this.workers = [];
    }

    /**
     * get worker info
     * @returns worker 정보 반환
     */
    getInfo: () => WorkerManagerInfo = () => {
        this.refreshAccessTime();
        this.refreshElapsedTime();

        return {
            id: this.id,
            numWorkers: this.numWorkers,
            dbName: this.dbName,
            status: this.status,
            durationMs: this.durationMs,
            accessTime: this.accessTime,
            elapsedTime: this.elapsedTime
        }
    }

    // private methods
    /**
     * refresh elapsed time
     */
    private refreshElapsedTime: () => void = () => {
        if (!this.startedAt) {
            return;
        }

        this.elapsedTime = Date.now() - this.startedAt.getTime();
    }

    /**
     * refresh access time
     */
    private refreshAccessTime: () => void = () => {
        this.accessTime = new Date();
    }

    /**
     * create workers
     */
    private createWorkers: () => void = () => {
        // worker 생성 전, 이전 worker가 존재한다면 중지
        if (this.workers.length > 0) {
            this.stop();
            this.clean();
        }

        // worker 생성
        for (let i = 0; i < this.numWorkers; i++) {
            const worker = new DbLoadWorker(this.dbName, `${this.id}-worker-${i}`, this.durationMs);
            this.workers.push(worker);
        }
    }
}

export default WorkerManager;