import { Worker } from 'node:worker_threads';

class DbLoadWorker {
    dbName: string;
    id: string;
    durationMs: number;
    private thread: Worker | null;

    constructor(dbName: string, id: string, durationMs: number) {
        this.dbName = dbName;
        this.id = id;
        this.durationMs = durationMs;
        this.thread = null;
    }

    start: () => void = () => {
        this.thread = new Worker(
            new URL('./db-load-runner.js', import.meta.url), { workerData: { dbName: this.dbName, id: this.id, durationMs: this.durationMs } }
        );

        this.thread.on('message', (message) => {
            console.log(`Worker ${this.id} message:`, message);
        });
    }

    stop: () => void = () => {
        if (this.thread) {
            this.thread.postMessage({ type: 'stop' });
        }
    }

    clean: () => void = () => {
        if (this.thread) {
            this.thread.terminate();
            this.thread = null;
        }
    }
}



export default DbLoadWorker;