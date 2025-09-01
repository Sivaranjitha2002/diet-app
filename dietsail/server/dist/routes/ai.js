"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiService_1 = require("../services/aiService");
const router = express_1.default.Router();
// Get AI meal recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const aiService = new aiService_1.AIService();
        const recommendations = await aiService.generateMealRecommendations(req.query.userId);
        console.log('AI recommendations:', recommendations);
        res.json(recommendations);
    }
    catch (error) {
        console.error('AI recommendations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Generate AI diet plan
router.post('/diet-plan', async (req, res) => {
    try {
        const aiService = new aiService_1.AIService();
        const { duration = 7 } = req.body;
        const dietPlan = await aiService.generateDietPlan(duration);
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