"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const datastore_1 = require("@zcatalyst/datastore");
const router = express_1.default.Router();
// Register
router.post('/register', async (req, res) => {
    try {
        const datastore = new datastore_1.Datastore();
        const { id, phone, age, gender, height, weight, targetWeight, activityLevel, dietGoal, dietPreferences, allergies, healthConditions } = req.body;
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map