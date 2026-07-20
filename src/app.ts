import express from 'express';
import cors from 'cors';

import { authRoutes } from './routes/auth.routes';
import { mealsRoutes } from './routes/meals.routes';
import { foodRouter } from './routes/food.routes';
import { healthRoutes } from './routes/health.routes';

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

app.get('/health-check', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/meals', mealsRoutes);
app.use('/foods', foodRouter);
app.use('/health-data', healthRoutes);