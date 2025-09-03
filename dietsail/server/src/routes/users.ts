import express from 'express';
import { Database } from '../config/database';
import { generateNutritionGoals } from '../utils/calculations';

import { ZCQL } from '@zcatalyst/zcql';

const router = express.Router();

// Get nutrition goals
router.get('/nutrition-goals', async (req: any, res) => {
  try {
    const zcql = new ZCQL();

    const userDetails = await zcql.executeZCQLQuery(`select * from users where id=${req.query.userId}`);

    const nutritionGoals = generateNutritionGoals(userDetails[0]['users']);
    res.json(nutritionGoals);
  } catch (error) {
    console.error('Get nutrition goals error:', error);
    res.status(500).json({ error: 'Get nutrition goals error:' + error });
  }
});

export default router;