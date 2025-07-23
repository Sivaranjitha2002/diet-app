"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const notificationService_1 = require("./services/notificationService");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const foods_1 = __importDefault(require("./routes/foods"));
const meals_1 = __importDefault(require("./routes/meals"));
const ai_1 = __importDefault(require("./routes/ai"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from React build
const frontendPath = path_1.default.join(__dirname, '../../dist');
app.use(express_1.default.static(frontendPath));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'NutriAI Backend'
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/foods', foods_1.default);
app.use('/api/meals', meals_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/notifications', notifications_1.default);
// Serve React app for all non-API routes
app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Initialize notification service
const notificationService = new notificationService_1.NotificationService();
// Start server
app.listen(PORT, () => {
    console.log(`🚀 NutriAI Server running on port ${PORT}`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
    console.log(`📱 SMS notifications: ${process.env.TWILIO_ACCOUNT_SID ? 'Enabled' : 'Disabled'}`);
    console.log(`🤖 AI services: Ready`);
    console.log(`⏰ Notification scheduler: Active`);
});
exports.default = app;
//# sourceMappingURL=index.js.map