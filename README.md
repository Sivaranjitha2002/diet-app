# NutriAI - AI-Powered Diet & Nutrition App

A comprehensive nutrition tracking application with AI-powered meal recommendations, BMI calculations, and automated notifications.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **User Authentication**: Secure login/register system
- **Dashboard**: Real-time nutrition tracking and progress visualization
- **Meal Planning**: Interactive meal planner with food search
- **AI Recommendations**: Personalized meal suggestions and insights
- **Notification Management**: Customizable reminders for meals, exercise, and health checks

### Backend (Node.js + Express)
- **RESTful API**: Clean, well-documented API endpoints
- **Authentication**: JWT-based secure authentication
- **AI Services**: Intelligent meal recommendations and diet plan generation
- **Notification System**: Automated email and SMS notifications
- **Data Management**: Comprehensive nutrition and user data handling
- **Health Calculations**: BMI, BMR, TDEE, and nutrition goal calculations

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building

### Backend
- Node.js with Express
- TypeScript for type safety
- JWT for authentication
- Nodemailer for email notifications
- Twilio for SMS notifications
- Node-cron for scheduled tasks

## 📦 Installation & Setup

### Single Server Setup (Recommended)

Run both frontend and backend from a single server:

1. Install all dependencies:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. Configure environment:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

3. Start single server (production mode):
   ```bash
   npm run start:single
   ```
   This will:
   - Build the frontend
   - Build the backend
   - Start the server at `http://localhost:3001`
   - Serve both UI and API from the same port

4. For development with hot reload:
   ```bash
   npm run dev:full
   ```

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - JWT_SECRET: Your JWT secret key
   - EMAIL_HOST, EMAIL_USER, EMAIL_PASS: Email service configuration
   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN: SMS service configuration

5. Start development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Email Notifications
Configure your email service in `server/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SMS Notifications
Set up Twilio for SMS notifications:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/nutrition-goals` - Get nutrition goals

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/search?q=query` - Search foods
- `GET /api/foods/:id` - Get food by ID

### Meals
- `POST /api/meals` - Create meal
- `GET /api/meals` - Get user meals
- `PATCH /api/meals/:id/consume` - Mark meal as consumed

### AI Services
- `GET /api/ai/recommendations` - Get AI meal recommendations
- `POST /api/ai/diet-plan` - Generate AI diet plan

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Update notification
- `PATCH /api/notifications/:id/toggle` - Toggle notification

## 🤖 AI Features

### Meal Recommendations
- Personalized meal suggestions based on user profile
- Nutritional analysis and optimization
- Dietary restriction consideration

### Diet Plan Generation
- Custom diet plans based on goals and preferences
- Calorie and macro distribution
- Progressive meal planning

### Smart Insights
- BMI and health metric analysis
- Progress tracking and recommendations
- Personalized nutrition tips

## 📧 Notification System

### Automated Reminders
- **Meal Times**: Breakfast, lunch, dinner reminders
- **Exercise**: Workout schedule notifications
- **Health Checks**: Weight tracking and health metric reminders
- **Custom**: User-defined notification schedules

### Delivery Methods
- **Email**: Rich HTML notifications with branding
- **SMS**: Concise text message alerts
- **In-App**: Real-time browser notifications

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Environment variable protection

## 🚀 Deployment

### Single Server Deployment
```bash
npm run start:single
# Server runs on port 3001 with both UI and API
```

### Development Mode
```bash
npm run dev:full
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# API calls proxied automatically
```

## 📊 Database Schema

The application uses an in-memory database for demonstration. In production, replace with:
- PostgreSQL for relational data
- MongoDB for document-based storage
- Redis for caching and sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints
