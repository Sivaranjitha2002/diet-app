import React, { useState, useEffect } from 'react';
import { Meal, NutritionGoals, Notification } from './types';
import { useAuthState } from './hooks/useAuth';
import { apiService } from './services/api';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MealPlanner } from './components/MealPlanner';
import { AIRecommendations } from './components/AIRecommendations';
import { NotificationPanel } from './components/NotificationPanel';
import { AuthForm } from './components/AuthForm';

function App() {
  const { user, loading, login, register, logout } = useAuthState();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<unknown>(null);

  const [todayProgress] = useState({
    calories: 1247,
    protein: 89,
    carbs: 156,
    fat: 45,
    fiber: 18,
    water: 1800
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [goals, userMeals, userNotifications, recommendations] = await Promise.all([
        apiService.getNutritionGoals(),
        apiService.getUserMeals(),
        apiService.getNotifications(),
        apiService.getAIRecommendations()
      ]);

      setNutritionGoals(goals);
      setMeals(userMeals);
      setNotifications(userNotifications);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleAddMeal = (meal: Omit<Meal, 'id'>) => {
    apiService.createMeal(meal)
      .then(response => {
        setMeals([...meals, response.meal]);
      })
      .catch(error => {
        console.error('Failed to create meal:', error);
      });
  };

  const handleToggleNotification = (id: string) => {
    apiService.toggleNotification(id)
      .then(response => {
        setNotifications(notifications.map(notif =>
          notif.id === id ? response.notification : notif
        ));
      })
      .catch(error => {
        console.error('Failed to toggle notification:', error);
      });
  };

  const handleUpdateNotification = (id: string, updates: Partial<Notification>) => {
    apiService.updateNotification(id, updates)
      .then(response => {
        setNotifications(notifications.map(notif =>
          notif.id === id ? response.notification : notif
        ));
      })
      .catch(error => {
        console.error('Failed to update notification:', error);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={login} onRegister={register} />;
  }

  if (!nutritionGoals) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your personalized nutrition plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onProfileClick={logout}
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Your AI-powered nutrition companion is here to help you achieve your health goals.
          </p>
        </div>

        <Dashboard
          user={user}
          nutritionGoals={nutritionGoals}
          todayProgress={todayProgress}
        />

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="xl:col-span-2">
            <MealPlanner meals={meals} onAddMeal={handleAddMeal} />
          </div>
          <div>
            {aiRecommendations ? (
              <AIRecommendations user={user} dailyCalories={nutritionGoals.calories} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onToggleNotification={handleToggleNotification}
        onUpdateNotification={handleUpdateNotification}
      />
    </div>
  );
}

export default App;