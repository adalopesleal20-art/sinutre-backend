import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';

export const foodRouter = Router();

// Listar e buscar alimentos
foodRouter.get('/', requireAuth, async (req, res) => {
  try {
    const search = String(req.query.search ?? '');

    const foods = await prisma.food.findMany({
      where: {
        userId: req.userId!,
        name: {
          contains: search,
        },
      },
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    return res.json(foods);
  } catch (error) {
    console.error('Erro ao listar alimentos:', error);

    return res.status(500).json({
      message: 'Não foi possível carregar os alimentos.',
    });
  }
});

// Cadastrar alimento
foodRouter.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      caloriesPer100g,
      carbsPer100g,
      proteinPer100g,
      fatPer100g,
    } = req.body;

    if (
      !name ||
      caloriesPer100g === undefined ||
      carbsPer100g === undefined ||
      proteinPer100g === undefined ||
      fatPer100g === undefined
    ) {
      return res.status(400).json({
        message: 'Preencha todos os campos do alimento.',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.userId!,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Sessão inválida. Saia e entre novamente com o GitHub.',
      });
    }

    const food = await prisma.food.create({
      data: {
        name: String(name).trim(),
        caloriesPer100g: Number(caloriesPer100g),
        carbsPer100g: Number(carbsPer100g),
        proteinPer100g: Number(proteinPer100g),
        fatPer100g: Number(fatPer100g),
        userId: req.userId!,
      },
    });

    return res.status(201).json(food);
  } catch (error) {
    console.error('Erro ao cadastrar alimento:', error);

    return res.status(500).json({
      message: 'Não foi possível cadastrar o alimento.',
    });
  }
});

// Editar alimento
foodRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      caloriesPer100g,
      carbsPer100g,
      proteinPer100g,
      fatPer100g,
    } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'Identificador do alimento inválido.',
      });
    }

    const existingFood = await prisma.food.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!existingFood) {
      return res.status(404).json({
        message: 'Alimento não encontrado.',
      });
    }

    const food = await prisma.food.update({
      where: {
        id,
      },
      data: {
        name: String(name).trim(),
        caloriesPer100g: Number(caloriesPer100g),
        carbsPer100g: Number(carbsPer100g),
        proteinPer100g: Number(proteinPer100g),
        fatPer100g: Number(fatPer100g),
      },
    });

    return res.json(food);
  } catch (error) {
    console.error('Erro ao editar alimento:', error);

    return res.status(500).json({
      message: 'Não foi possível editar o alimento.',
    });
  }
});

// Excluir alimento
foodRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'Identificador do alimento inválido.',
      });
    }

    const result = await prisma.food.deleteMany({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: 'Alimento não encontrado.',
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir alimento:', error);

    return res.status(500).json({
      message: 'Não foi possível excluir o alimento.',
    });
  }
});