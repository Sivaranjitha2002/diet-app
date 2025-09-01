"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calculations_1 = require("../utils/calculations");
const zcql_1 = require("@zcatalyst/zcql");
const router = express_1.default.Router();
// Get nutrition goals
router.get('/nutrition-goals', async (req, res) => {
    try {
        const zcql = new zcql_1.ZCQL();
        const userDetails = await zcql.executeZCQLQuery(`select * from users where id=30268000000046003`);
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