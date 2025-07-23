import express from 'express';
import { Database } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const db = Database.getInstance();

// Create meal
router.post('/', authenticateToken, (req: any, res) => {
  try {
    const mealData = {
      ...req.body,
      userId: req.user.userId
    };

    const meal = db.createMeal(mealData);
    res.status(201).json({
      message: 'Meal created successfully',
      meal
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user meals
router.get('/', authenticateToken, (req: any, res) => {
  try {
    const { date } = req.query;
    let meals;

    if (date) {
      meals = db.getMealsByUserAndDate(req.user.userId, date as string);
    } else {
      meals = db.getMealsByUserId(req.user.userId);
    }

    res.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meal consumption status
router.patch('/:id/consume', authenticateToken, (req: any, res) => {
  try {
    const meal = db.meals.get(req.params.id);
    if (!meal || meal.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const updatedMeal = { ...meal, consumed: true };
    db.meals.set(req.params.id, updatedMeal);

    res.json({
      message: 'Meal marked as consumed',
      meal: updatedMeal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;