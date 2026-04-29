/**
 * worker business code
 */

import { randomUUID } from 'node:crypto';

const WorkerManagerStatus = {
    READY: 'ready',
    RUNNING: 'running',
    STOPPED: 'stopped'
} as const;

type WorkerManagerStatus = typeof WorkerManagerStatus[keyof typeof WorkerManagerStatus];

type WorkerManagerInfo = {
    id: string;
    numWorkers: number;
    dbName: string;
    status: WorkerManagerStatus;
    durationMs: number;
    elapsedTime: number;
    accessTime: Date;
}


class Worker {
    dbName: string;
    id: string;

    constructor(dbName: string, id: string) {
        this.dbName = dbName;
        this.id = id;
    }

    start: () => void = () => {
        // TO-DO: worker start
    }

    stop: () => void = () => {
        // TO-DO: worker stop
    }

    clean: () => void = () => {
        // TO-DO: worker 리소스 정리
    }
}

class WorkerManager {
    id: string;
    workers: Worker[] = [];
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
            const worker = new Worker(this.dbName, `${this.id}-worker-${i}`);
            this.workers.push(worker);
        }
    }
}

const workerManagerMap: Map<string, WorkerManager> = new Map();

/**
 * worker manager 생성
 * @param numWorkers 
 * @param dbName 
 * @param duration 
 * @returns 
 */
export function createWorkerManager(numWorkers: number, dbName: string, duration: number): WorkerManager {
    const workerManager = new WorkerManager(numWorkers, dbName, duration);

    // workerManager 접근을 위해, local 객체에 저장
    workerManagerMap.set(workerManager.id, workerManager);

    return workerManager;
}

/**
 * worker manager 조회
 * @param workerManagerId 
 * @returns worker manager 반환, 존재하지 않는 경우 null 반환
 */
export function getWorkerManager(workerManagerId: string): WorkerManager | null {
    return workerManagerMap.get(workerManagerId) || null;
}

/**
 * worker manager list 조회
 * @returns worker manager 목록 반환
 */
export function getWorkerManagerList(): WorkerManagerInfo[] {
    const statusList: WorkerManagerInfo[] = [];
    for (const workerManager of workerManagerMap.values()) {
        statusList.push(workerManager.getInfo()); // worker manager 상태 업데이트
    }
    return statusList;
}

/**
 * worker manager 업데이트
 * @returns 
 */
export function updateWorkerManager(workerManagerId: string, numWorkers: number, dbName: string, duration: number): boolean {
    const workerManager = getWorkerManager(workerManagerId);
    if (!workerManager) {
        return false;
    }

    workerManager.update(numWorkers, dbName, duration);
    return true;
}

/**
 * worker manager 중지
 * @returns 
 */
export function stopWorkerManager(workerManagerId: string): boolean {
    const workerManager = getWorkerManager(workerManagerId);
    if (!workerManager) {
        return false;
    }

    workerManager.stop();
    return true;
}

/**
 * worker manager 삭제
 * @returns 
 */
export function deleteWorkerManager(workerManagerId: string): boolean {
    const workerManager = getWorkerManager(workerManagerId);
    if (!workerManager) {
        return false;
    }

    workerManager.stop();
    workerManager.clean();
    workerManagerMap.delete(workerManagerId);
    return true;
}