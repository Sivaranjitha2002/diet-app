import express from 'express';
import bcrypt from 'bcryptjs';
import { Database } from '../config/database';
import { generateToken } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

const router = express.Router();
const db = Database.getInstance();
const notificationService = new NotificationService();

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
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

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = db.createUser({
      name,
      email,
      password: hashedPassword,
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

    // Create default notifications for user
    notificationService.createUserNotifications(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;