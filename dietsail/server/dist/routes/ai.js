"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const aiService_1 = require("../services/aiService");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
const aiService = new aiService_1.AIService();
// Get AI meal recommendations
router.get('/recommendations', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = db.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const recommendations = await aiService.generateMealRecommendations(user);
        res.json(recommendations);
    }
    catch (error) {
        console.error('AI recommendations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Generate AI diet plan
router.post('/diet-plan', auth_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        console.error('AI diet plan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map