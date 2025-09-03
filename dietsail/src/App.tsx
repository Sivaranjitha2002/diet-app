import React, { useState, useEffect, useCallback } from 'react';
import { Meal, NutritionGoals, Notification } from './types';
import { useAuthState } from './hooks/useAuth';
import { apiService } from './services/api';
import { Header } from './components/Header';
import { MealPlanner } from './components/MealPlanner';
import { NotificationPanel } from './components/NotificationPanel';
import { Login } from './components/Login';
import { AuthForm } from './components/AuthForm';
import { useRegisterState } from './hooks/registerData';

function App() {
  const { user, loading } = useAuthState();
  const { userData } = useRegisterState(user?.user_id || '');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadUserData = useCallback(async () => {
    try {
      const [goals, userMeals, userNotifications] = await Promise.all([
        apiService.getNutritionGoals(user.user_id),
        apiService.getUserMeals(user.user_id),
        apiService.getNotifications(user.user_id),
      ]);;
      setNutritionGoals(goals);
      setMeals(userMeals.meals || []);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, [user]);

  useEffect(() => {
    console.log('User data or user changed, loading user data...', userData);
    if (user && userData) {
      loadUserData();
    }
  }, [user, userData, loadUserData]);

  const handleAddMeal = (meal: Omit<Meal, 'id'>) => {
    apiService.createMeal(meal, user.user_id)
      .then(response => {
        setMeals([...meals, response.meal]);
      })
      .catch(error => {
        console.error('Failed to create meal:', error);
      });
  };

  const handleMealCompleted = async (mealId: string, isCompleted: boolean, mealNutrition: any) => {
    // Implement your logic here, e.g., update meal completion status in backend or state
    console.log(`Meal ${mealId} completed: ${isCompleted}`, mealNutrition);
    // Example: update meal in state (if needed)
    setMeals(prevMeals =>
      prevMeals.map(meal =>
        meal.id === mealId ? { ...meal, completed: isCompleted } : meal
      )
    );
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
  // if (userDataLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
  //         <p className="text-lg font-medium text-gray-700">Loading your profile...</p>
  //       </div>
  //     </div>
  //   );
  // }
  
  if (!user) {
    return <Login />;
  } else if (!userData) {
    console.log('User data is not available', userData);
    return <AuthForm userName={user.first_name + ' ' + user.last_name} userId={user.user_id} />;
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

  // const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.first_name}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name}! 👋
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div>
            <MealPlanner meals={meals} onAddMeal={handleAddMeal} onMealCompleted={handleMealCompleted} userId={user.user_id}/>
          </div>
        </div>

        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onToggleNotification={handleToggleNotification}
          onUpdateNotification={handleUpdateNotification}
        />
      </main>
    </div>
  );
}

export default App;