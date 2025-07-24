"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const notificationService_1 = require("../services/notificationService");
const user_management_1 = require("@zcatalyst/user-management");
const datastore_1 = require("@zcatalyst/datastore");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
const notificationService = new notificationService_1.NotificationService();
const userManagement = new user_management_1.UserManagement();
const datastore = new datastore_1.Datastore();
// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, age, gender, height, weight, targetWeight, activityLevel, dietGoal, dietPreferences, allergies, healthConditions } = req.body;
        // Check if user already exists
        const existingUser = (await userManagement.getAllUsers()).find(user => user.email_id === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const userResponse = await userManagement.registerUser({ platform_type: 'web' }, { email_id: email, first_name: firstName, last_name: lastName });
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map