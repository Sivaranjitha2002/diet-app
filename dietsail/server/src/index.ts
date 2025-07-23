import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { NotificationService } from './services/notificationService';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import foodRoutes from './routes/foods';
import mealRoutes from './routes/meals';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NutriAI Backend'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
const notificationService = new NotificationService();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NutriAI Server running on port ${PORT}`);
  console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
  console.log(`📱 SMS notifications: ${process.env.TWILIO_ACCOUNT_SID ? 'Enabled' : 'Disabled'}`);
  console.log(`🤖 AI services: Ready`);
  console.log(`⏰ Notification scheduler: Active`);
});

export default app;