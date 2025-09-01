import express from 'express';
import path from 'path';
import { MealScheduler } from './services/mealScheduler';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import foodRoutes from './routes/foods';
import mealRoutes from './routes/meals';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;

// Middleware
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://your-frontend-domain.com'] 
//     : ['http://localhost:5173', 'http://localhost:3000'],
//   credentials: true
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build with proper MIME types
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.json')) {
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
app.use('/api/data', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve React homepage at root
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
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

// Initialize meal scheduler
const mealScheduler = new MealScheduler();

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

export default app;