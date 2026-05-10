import 'dotenv/config';
import express from 'express';
import { resetDatabaseOnStartup } from './database/index.js';
import router from './routes/index.js';

const app = express();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());
app.use(express.static('public'));

app.use('/', router);

async function bootstrap(): Promise<void> {
    await resetDatabaseOnStartup();

    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
}

bootstrap().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
