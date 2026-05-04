/**
 * 데이터베이스 관련 비즈니스 로직을 처리하는 모듈입니다.
 */


import PostgresDB from './postgres.js';

type DBNames = 'postgres' | 'mysql';

export async function insertLoadSample(dbName: string, worker_id: string, group_id: string, sequence: number) {
    if (dbName === 'postgres') {
        await PostgresDB.insertSampleData(worker_id, group_id, sequence);
    }
    else if (dbName === 'mysql') {
        // to-do: MySQL에 샘플 데이터 삽입 로직   
    }
    else {
        console.error(`Unsupported database: ${dbName}`);
    }
}

export async function cleanUpSamples(dbName: string): Promise<void> {
    if (dbName === 'postgres') {
        // to-do: PostgreSQL 샘플 데이터 정리 로직
    }
    else if (dbName === 'mysql') {
        // to-do: MySQL 샘플 데이터 정리 로직
    }
    else {
        console.error(`Unsupported database: ${dbName}`);
    }
}