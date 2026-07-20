import express from 'express';
import cors from 'cors';

import { authRoutes } from './routes/auth.routes';
import { mealsRoutes } from './routes/meals.routes';
import { foodRouter } from './routes/food.routes';
import { healthRoutes } from './routes/health.routes';

export const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://crispy-doodle-97pvq9x6jv4rhx6v6-5173.app.github.dev',
    ],
    credentials: true,
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