/**
 * PostgreSQL 데이터베이스 연결 및 쿼리 실행을 위한 클래스
 * - Pool을 사용하여 연결 관리
 * - insertSampleData 메서드를 통해 샘플 데이터 삽입 기능 제공
 * - connect 메서드를 통해 필요할 때 연결 설정
 */

import { Pool } from 'pg';

class PostgresDB {
    private pool: Pool | null = null;

    constructor() {
        // 실제로 DB 연결이 필요할 떄 connect() 메서드를 호출하여 연결을 설정하도록 구성
    }

    // method
    public async getDistribution(): Promise<{ group_id: string, count: number }[]> {
        await this.connect();

        if (this.pool) {
            // group_id 별로 샘플 데이터 개수 조회
            const query = 'SELECT group_id, COUNT(*) AS count FROM sample_data GROUP BY group_id';
            const result = await this.pool.query(query);
            return result.rows.map(row => ({ group_id: row.group_id, count: parseInt(row.count, 10) }));
        }
        return [];
    }

    public async insertSampleData(worker_id: string, group_id: string, sequence: number): Promise<void> {
        await this.connect();
        
        if (this.pool) {
            // id, worker_id, group_id, sequence, created_at
            const query = 'INSERT INTO sample_data (id, worker_id, group_id, sequence, created_at) VALUES ($1, $2, $3, $4, NOW())';
            await this.pool.query(query, [`${worker_id}_${sequence}`, worker_id, group_id, sequence]);
        }
    }

    public async cleanupSamples(group_id: string): Promise<void> {
        await this.connect();

        if (this.pool) {
            const query = 'DELETE FROM sample_data WHERE group_id = $1';
            await this.pool.query(query, [group_id]);
        }
    }

    // private
    private async connect(): Promise<void> {
        if (!this.pool) {
            this.pool = new Pool({
                host: process.env.PG_HOST || 'localhost',
                port: parseInt(process.env.PG_PORT || '5432'),
                user: process.env.PG_USER || 'postgres',
                password: process.env.PG_PASSWORD || 'password',
                database: process.env.PG_DATABASE || 'postgres',
                max: 1
            });

            // 최초 연결 시도하여, 미리 연결 열어두기
            await this.pool.query('SELECT 1').catch((error) => {
                console.error('Failed to connect to PostgreSQL:', error);
                this.pool = null; // 연결 실패 시 pool 초기화
            });
        }
    }
}

export default new PostgresDB();