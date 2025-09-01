"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    // const authHeader = req.headers['cookie'];
    // const token = authHeader && authHeader.split(' ')[1];
    // const token = req.cookies.token;
    console.log('middleware triggered');
    next();
};
exports.authenticateToken = authenticateToken;
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '7d'
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map