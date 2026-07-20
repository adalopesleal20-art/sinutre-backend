import { Router } from 'express';

import { LEVEL_CHOICES } from '../constants/enums';
import { requireAuth } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';

export const healthRoutes = Router();

healthRoutes.get('/', requireAuth, async (req, res) => {
  const userId = req.userId!;

  const [weightLog, healthData] = await Promise.all([
    prisma.weightLog.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.healthData.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return res.json({
    height: weightLog?.height ?? null,
    weight: weightLog?.weight ?? null,
    targetDietDaily:
      healthData?.targetDietDaily ?? null,
    levelActivity:
      healthData?.levelActivity ?? null,
  });
});

healthRoutes.put('/', requireAuth, async (req, res) => {
  const userId = req.userId!;

  const {
    height,
    weight,
    targetDietDaily,
    levelActivity,
  } = req.body;

  const parsedHeight = Number(height);
  const parsedWeight = Number(weight);
  const parsedTarget = Number(targetDietDaily);

  if (
    !Number.isFinite(parsedHeight) ||
    parsedHeight <= 0
  ) {
    return res.status(400).json({
      message: 'Informe uma altura válida.',
    });
  }

  if (
    !Number.isFinite(parsedWeight) ||
    parsedWeight <= 0
  ) {
    return res.status(400).json({
      message: 'Informe um peso válido.',
    });
  }

  if (
    !Number.isInteger(parsedTarget) ||
    parsedTarget <= 0
  ) {
    return res.status(400).json({
      message: 'Informe uma meta calórica válida.',
    });
  }

  const chosenLevel =
    levelActivity ?? 'SEDENTARIO';

  if (!LEVEL_CHOICES.includes(chosenLevel)) {
    return res.status(400).json({
      message: 'Nível de atividade inválido.',
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.weightLog.create({
      data: {
        height: parsedHeight,
        weight: parsedWeight,
        userId,
      },
    });

    await tx.healthData.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        closedAt: new Date(),
      },
    });

    await tx.healthData.create({
      data: {
        targetDietDaily: parsedTarget,
        levelActivity: chosenLevel,
        userId,
      },
    });
  });

  return res.status(200).json({
    message: 'Dados de saúde salvos com sucesso.',
  });
});