import express from 'express';
import { Database } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const db = Database.getInstance();

// Get all foods
router.get('/', authenticateToken, async (req, res) => {
  try {
    const foods = await db.getAllFoods();
    res.json(foods);
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search foods
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const foods = db.searchFoods(q);
    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get food by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const food = db.getFoodById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;