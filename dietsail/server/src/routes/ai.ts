import express from 'express';
import { Database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AIService } from '../services/aiService';

const router = express.Router();
const db = Database.getInstance();
const aiService = new AIService();

// Get AI meal recommendations
router.get('/recommendations', authenticateToken, async (req: any, res) => {
  try {
    const user = db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recommendations = await aiService.generateMealRecommendations(user);
    res.json(recommendations);
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate AI diet plan
router.post('/diet-plan', authenticateToken, async (req: any, res) => {
  try {
    const user = db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { duration = 7 } = req.body;
    const dietPlan = await aiService.generateDietPlan(user, duration);
    
    res.json({
      message: 'AI diet plan generated successfully',
      dietPlan
    });
  } catch (error) {
    console.error('AI diet plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;