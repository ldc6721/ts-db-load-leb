import { parentPort, workerData } from 'node:worker_threads';

type WorkerData = {
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

    while (!stop && Date.now() - startedAt < data.durationMs) {
        // TO-DO: DB load 작업 수행
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