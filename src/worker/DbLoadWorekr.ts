import { Worker } from 'node:worker_threads';

/**
 * dev 모드에서 파일 경로 문제를 해결하기 위해 import.meta.url을 활용하여 런너 스크립트의 path 동적 생성
 * @returns {URL}
 */
function getRunnerUrl(): URL {
    const runnerFileName = import.meta.url.endsWith('.ts') ? '../../dist/worker/db-load-runner.js' : './db-load-runner.js';
    return new URL(runnerFileName, import.meta.url);
}

class DbLoadWorker {
    dbName: string;
    group_id: string;
    id: string;
    durationMs: number;
    private onDone: () => void;
    private thread: Worker | null;

    constructor(dbName: string, group_id: string, id: string, durationMs: number, onDone: () => void) {
        this.dbName = dbName;
        this.group_id = group_id;
        this.id = id;
        this.durationMs = durationMs;
        this.onDone = onDone;
        this.thread = null;
    }

    start: () => void = () => {
        this.thread = new Worker(
            getRunnerUrl(),
            {
                workerData: { dbName: this.dbName, group_id: this.group_id, id: this.id, durationMs: this.durationMs }
            }
        );

        this.thread.on('message', (message) => {
            console.log(`Worker ${this.id} message:`, message);

            if (message.type === 'done' || message.type === 'error') {
                this.onDone();
            }
        });

        this.thread.on('error', (error: Error) => {
            console.error(`Worker ${this.id} error:`, error.message);
            this.onDone();
        });
    }

    stop: () => void = () => {
        if (this.thread) {
            this.thread.postMessage({ type: 'stop' });
        }
    }

    clean: () => Promise<void> = async () => {
        if (this.thread) {
            await this.thread.terminate();
            this.thread = null;
        }
    }
}



export default DbLoadWorker;
