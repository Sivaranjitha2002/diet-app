import express from 'express';
import { Database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { generateNutritionGoals } from '../utils/calculations';

const router = express.Router();
const db = Database.getInstance();

// Get user profile
router.get('/profile', authenticateToken, (req: any, res) => {
  try {
    const user = db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req: any, res) => {
  try {
    const updates = req.body;
    delete updates.id;
    delete updates.password;
    delete updates.createdAt;

    const updatedUser = db.updateUser(req.user.userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userResponse } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nutrition goals
router.get('/nutrition-goals', authenticateToken, (req: any, res) => {
  try {
    const user = db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nutritionGoals = generateNutritionGoals(user);
    res.json(nutritionGoals);
  } catch (error) {
    console.error('Get nutrition goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;