import express from 'express';
import bcrypt from 'bcryptjs';
import { Database } from '../config/database';
import { generateToken } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';
import { UserManagement } from '@zcatalyst/user-management';
import { Datastore } from '@zcatalyst/datastore';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const db = Database.getInstance();
const notificationService = new NotificationService();
const userManagement = new UserManagement();
const datastore = new Datastore();
// Register
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
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

    // Check if user already exists
    const existingUser = (await userManagement.getAllUsers()).find(user => user.email_id === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResponse = await userManagement.registerUser({platform_type: 'web'}, {email_id: email, first_name: firstName, last_name: lastName});

    const insertResponse = await datastore.table('users').insertRow({
      id: userResponse.id,
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = (await userManagement.getAllUsers()).find(user => user.email_id === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;