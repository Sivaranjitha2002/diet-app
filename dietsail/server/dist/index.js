"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mealScheduler_1 = require("./services/mealScheduler");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const foods_1 = __importDefault(require("./routes/foods"));
const meals_1 = __importDefault(require("./routes/meals"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const app = (0, express_1.default)();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;
// Middleware
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://your-frontend-domain.com'] 
//     : ['http://localhost:5173', 'http://localhost:3000'],
//   credentials: true
// }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from React build with proper MIME types
const frontendPath = path_1.default.join(__dirname, '../../dist');
app.use(express_1.default.static(frontendPath, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    }
}));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'NutriAI Backend'
    });
});
// API Routes
app.use('/api/data', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/foods', foods_1.default);
app.use('/api/meals', meals_1.default);
app.use('/api/notifications', notifications_1.default);
// Serve React homepage at root
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// Serve React app for all non-API and non-asset routes
app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // Don't serve React app for static assets
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return res.status(404).send('Asset not found');
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
// Initialize meal scheduler
const mealScheduler = new mealScheduler_1.MealScheduler();
// Start server
app.listen(PORT, () => {
    console.log(`🚀 NutriAI Server running on port ${PORT}`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
    console.log(`📱 SMS notifications: ${process.env.TWILIO_ACCOUNT_SID ? 'Enabled' : 'Disabled'}`);
    console.log(`🤖 AI services: Ready`);
    console.log(`⏰ Notification scheduler: Active`);
    // Start meal notification scheduler
    mealScheduler.start();
    console.log(`🍽️ Meal notification scheduler: Active`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    mealScheduler.stop();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    mealScheduler.stop();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map