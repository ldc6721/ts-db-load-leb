/**
 * worker business code
 */

import WorkerManager from './WorkerManager.js';
import { WorkerManagerInfo } from './types.js';

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