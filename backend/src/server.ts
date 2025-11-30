import 'dotenv/config';

import express from 'express';
import router from './routes/router.js';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use('/api', router);


app.get('/', (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});