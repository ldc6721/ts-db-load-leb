import express from 'express';
import router from './routes/index.js';

const app = express();

const PORT:number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

app.use('/', router);

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})