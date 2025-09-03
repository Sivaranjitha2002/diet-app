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
        // const { userId } = req.query;
        console.log('Fetching nutrition goals for user:', req.query);
        const userDetails = await zcql.executeZCQLQuery(`select * from users where id=${req.query.userId}`);
        const nutritionGoals = (0, calculations_1.generateNutritionGoals)(userDetails[0]['users']);
        res.json(nutritionGoals);
    }
    catch (error) {
        console.error('Get nutrition goals error:', error);
        res.status(500).json({ error: 'Get nutrition goals error:' + error });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map