import express from 'express';
import cors from 'cors';
import routes from './routes/index.mjs';
import { errorHandler } from './middlewares/error.middleware.mjs';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

export default app;
