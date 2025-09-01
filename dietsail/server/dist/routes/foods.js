"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zcql_1 = require("@zcatalyst/zcql");
const datastore_1 = require("@zcatalyst/datastore");
const search_1 = require("@zcatalyst/search");
const router = express_1.default.Router();
// Get all foods
router.get('/', async (req, res) => {
    const db = new zcql_1.ZCQL();
    try {
        const foods = await db.executeZCQLQuery('select * from foods');
        res.json(foods);
    }
    catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Search foods
router.get('/search', async (req, res) => {
    try {
        const search = new search_1.Search();
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query required' });
        }
        const foods = await search.executeSearchQuery({
            search: q,
            search_table_columns: {
                ['foods']: ['name', 'category']
            }
        });
        res.json(foods);
    }
    catch (error) {
        console.error('Search foods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get food by ID
router.get('/:id', async (req, res) => {
    try {
        const datastore = new datastore_1.Datastore();
        const food = await datastore.table('foods').getRow(req.params.id);
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