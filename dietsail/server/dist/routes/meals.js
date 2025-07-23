"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
// Create meal
router.post('/', auth_1.authenticateToken, (req, res) => {
    try {
        const mealData = {
            ...req.body,
            userId: req.user.userId
        };
        const meal = db.createMeal(mealData);
        res.status(201).json({
            message: 'Meal created successfully',
            meal
        });
    }
    catch (error) {
        console.error('Create meal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user meals
router.get('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { date } = req.query;
        let meals;
        if (date) {
            meals = db.getMealsByUserAndDate(req.user.userId, date);
        }
        else {
            meals = db.getMealsByUserId(req.user.userId);
        }
        res.json(meals);
    }
    catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update meal consumption status
router.patch('/:id/consume', auth_1.authenticateToken, (req, res) => {
    try {
        const meal = db.meals.get(req.params.id);
        if (!meal || meal.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Meal not found' });
        }
        const updatedMeal = { ...meal, consumed: true };
        db.meals.set(req.params.id, updatedMeal);
        res.json({
            message: 'Meal marked as consumed',
            meal: updatedMeal
        });
    }
    catch (error) {
        console.error('Update meal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=meals.js.map