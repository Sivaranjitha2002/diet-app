import express from 'express';
import { Database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { generateNutritionGoals } from '../utils/calculations';

import { UserManagement } from '@zcatalyst/user-management';
import { Datastore } from '@zcatalyst/datastore';
import { ZCQL } from '@zcatalyst/zcql';


const router = express.Router();
const db = Database.getInstance();
const userManagement = new UserManagement();
const datastore = new Datastore();
const zcql = new ZCQL();


// Get user profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await userManagement.getCurrentUser();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDetails = await datastore.table('users').getRow(user.user_id);

    res.json(userDetails);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    console.log('Updating profile for user:', req.user.userId);
    const updates = req.body;

    const updatedUser = await userManagement.updateUserDetails(req.user.userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nutrition goals
router.get('/nutrition-goals', authenticateToken, async (req: any, res) => {
  try {
    const user = await userManagement.getCurrentUser();
    console.log('user:::', user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDetails = await zcql.executeZCQLQuery(`select * from users where id = '${user.user_id}'`);

    const nutritionGoals = generateNutritionGoals(userDetails[0]['users']);
    res.json(nutritionGoals);
  } catch (error) {
    console.error('Get nutrition goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;