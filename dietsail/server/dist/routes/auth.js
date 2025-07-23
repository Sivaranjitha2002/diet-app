"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const notificationService_1 = require("../services/notificationService");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
const notificationService = new notificationService_1.NotificationService();
// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, age, gender, height, weight, targetWeight, activityLevel, dietGoal, dietPreferences, allergies, healthConditions } = req.body;
        // Check if user already exists
        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
        const token = (0, auth_1.generateToken)(user.id);
        // Remove password from response
        const { password: _, ...userResponse } = user;
        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            token
        });
    }
    catch (error) {
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
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user.id);
        // Remove password from response
        const { password: _, ...userResponse } = user;
        res.json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map