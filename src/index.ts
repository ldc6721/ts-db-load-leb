import express from 'express';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
})

app.get('/', (req, res) => {
  res.send('Hello, World!');
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})