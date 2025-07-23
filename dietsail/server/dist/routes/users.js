"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const calculations_1 = require("../utils/calculations");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
// Get user profile
router.get('/profile', auth_1.authenticateToken, (req, res) => {
    try {
        const user = db.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userResponse } = user;
        res.json(userResponse);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, (req, res) => {
    try {
        const updates = req.body;
        delete updates.id;
        delete updates.password;
        delete updates.createdAt;
        const updatedUser = db.updateUser(req.user.userId, updates);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userResponse } = updatedUser;
        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get nutrition goals
router.get('/nutrition-goals', auth_1.authenticateToken, (req, res) => {
    try {
        const user = db.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const nutritionGoals = (0, calculations_1.generateNutritionGoals)(user);
        res.json(nutritionGoals);
    }
    catch (error) {
        console.error('Get nutrition goals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map