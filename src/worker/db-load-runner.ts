import { parentPort, workerData } from 'node:worker_threads';
import { insertLoadSample } from '../database/index.js';

let sequence: number = 0;

type WorkerData = {
    group_id: string;
    id: string;
    dbName: string;
    durationMs: number;
};

const data = workerData as WorkerData;

let stop: boolean = false;

parentPort?.on('message', (message: { type: string }) => {
    if (message.type === 'stop') {
        stop = true;
    }
});

async function run(): Promise<void> {
    const startedAt = Date.now();

    parentPort?.postMessage({
        type: 'started',
        workerId: data.id
    });

    // 주어진 duration 동안 샘플 데이터를 삽입하는 루프
    while (!stop && Date.now() - startedAt < data.durationMs) {
        await insertLoadSample(data.dbName, data.id, data.group_id, sequence++);
    }

    parentPort?.postMessage({
        type: 'done',
        workerId: data.id
    });
}

run().catch((error: unknown) => {
    parentPort?.postMessage({
        type: 'error',
        workerId: data.id,
        message: error instanceof Error ? error.message : 'Unknown error'
    });
});