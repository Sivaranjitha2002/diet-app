import express from 'express';
import { Database } from '../config/database';
import { ZCQL } from '@zcatalyst/zcql';

const router = express.Router();
// Load environment variables

// Create meal
router.post('/', async(req: any, res) => {
  const db = Database.getInstance();
  console.log('Creating meal for user:', req.query);
    console.log('Creating meal for user:', req.user);
  try {
    const mealData = {
      ...req.body,
      userId: req.query.userId
    };

    console.log('Meal data:', mealData);

    const meal = await db.createMeal(mealData);
    console.log('Meal created:', meal);
    res.status(201).json({
      message: 'Meal created successfully',
      meal
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// update meal
router.put('/', async(req: any, res) => {
  const db = Database.getInstance();
  const zcql = new ZCQL();
  console.log('Creating meal for user:', req.query);
  console.log('Creating meal for user:', req.user);
  try {
    const mealData = {
      ...req.body,
      userId: req.query.userId
    };

    console.log('Meal data:', mealData);

    const meals = await zcql.executeZCQLQuery(`select * from meals where userId='${req.user.userId}'`);

    const meal = await db.updateMeal(meals[0].meals['ROWID'], mealData);
    console.log('Meal created:', meal);
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
router.get('/', async (req: any, res) => {
  try {
    const db = Database.getInstance();
    const { userId } = req.query;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    console.log('Fetching meals for user1:', userId, 'on date:', formattedDate);
   
    let meals;
    if (formattedDate) {
      meals = await db.getMealsByUserAndDate(userId, formattedDate);
    } else {
      meals = await db.getMealsByUserId(userId);
    }
    meals =  meals.map((meal) => meal.length !== 0 ? meal.meals : []);

    res.json({ meals });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meal consumption status
router.patch('/:id/consume', async (req: any, res) => {
  try {
    const db = Database.getInstance();
    const meal = await db.getMealsByUserId(req.params.id);
    if (!meal || (meal as Record<string, any>).CREATORID !== req.user.userId) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const updatedMeal = { ...meal, consumed: true };
    await db.updateMeal(req.params.id, updatedMeal);

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