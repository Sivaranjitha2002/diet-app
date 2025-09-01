import express from 'express';
import { Datastore } from '@zcatalyst/datastore';

const router = express.Router();
// Register
router.post('/register', async (req, res) => {
  try {
    const datastore = new Datastore();
    const {
      id,
      phone,
      age,
      gender,
      height,
      weight,
      targetWeight,
      activityLevel,
      dietGoal,
      dietPreferences,
      allergies,
      healthConditions
    } = req.body;

    const insertResponse = await datastore.table('users').insertRow({
      id,
      phone,
      age,
      gender,
      height,
      weight,
      targetWeight,
      activityLevel,
      dietGoal,
      dietPreferences: dietPreferences || [],
      allergies: allergies || [],
      healthConditions: healthConditions || []
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: insertResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;