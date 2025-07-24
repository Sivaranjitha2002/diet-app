"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const calculations_1 = require("../utils/calculations");
const user_management_1 = require("@zcatalyst/user-management");
const datastore_1 = require("@zcatalyst/datastore");
const zcql_1 = require("@zcatalyst/zcql");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
const userManagement = new user_management_1.UserManagement();
const datastore = new datastore_1.Datastore();
const zcql = new zcql_1.ZCQL();
// Get user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await userManagement.getCurrentUser();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userDetails = await datastore.table('users').getRow(user.user_id);
        res.json(userDetails);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        console.log('Updating profile for user:', req.user.userId);
        const updates = req.body;
        const updatedUser = await userManagement.updateUserDetails(req.user.userId, updates);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get nutrition goals
router.get('/nutrition-goals', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await userManagement.getCurrentUser();
        console.log('user:::', user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userDetails = await zcql.executeZCQLQuery(`select * from users where id = '${user.user_id}'`);
        const nutritionGoals = (0, calculations_1.generateNutritionGoals)(userDetails[0]['users']);
        res.json(nutritionGoals);
    }
    catch (error) {
        console.error('Get nutrition goals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map