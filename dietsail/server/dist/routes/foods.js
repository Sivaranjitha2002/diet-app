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
// Get all foods
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const foods = await db.getAllFoods();
        res.json(foods);
    }
    catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Search foods
router.get('/search', auth_1.authenticateToken, (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query required' });
        }
        const foods = db.searchFoods(q);
        res.json(foods);
    }
    catch (error) {
        console.error('Search foods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get food by ID
router.get('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const food = db.getFoodById(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food not found' });
        }
        res.json(food);
    }
    catch (error) {
        console.error('Get food error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=foods.js.map