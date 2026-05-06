import { Worker } from 'node:worker_threads';

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
            new URL('./db-load-runner.js', import.meta.url), { workerData: { dbName: this.dbName, group_id: this.group_id, id: this.id, durationMs: this.durationMs } }
        );

        this.thread.on('message', (message) => {
            console.log(`Worker ${this.id} message:`, message);

            if (message.type === 'done') {
                this.onDone();
            }
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
