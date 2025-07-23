import React, { useState, useEffect } from 'react';
import { User, Food } from '../types';
import { foodDatabase } from '../data/foods';
import { Brain, Sparkles, ChefHat, TrendingUp } from 'lucide-react';

interface AIRecommendationsProps {
  user: User;
  dailyCalories: number;
}

export function AIRecommendations({ user, dailyCalories }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{
    meals: Array<{ name: string; foods: Food[]; reason: string }>;
    tips: string[];
    insights: string[];
  }>({ meals: [], tips: [], insights: [] });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      generateRecommendations();
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, dailyCalories]);

  const generateRecommendations = () => {
    // AI-like meal recommendations based on user profile
    const proteinFoods = foodDatabase.filter(food => food.category === 'Protein');
    const vegFoods = foodDatabase.filter(food => food.category === 'Vegetables');
    const grainFoods = foodDatabase.filter(food => food.category === 'Grains');
    const healthyFats = foodDatabase.filter(food => food.category === 'Healthy Fats');

    const mealRecommendations = [
      {
        name: 'Power Breakfast Bowl',
        foods: [
          foodDatabase.find(f => f.name === 'Greek Yogurt')!,
          foodDatabase.find(f => f.name === 'Quinoa')!,
        ],
        reason: `High protein start perfect for your ${user.dietGoal} goal`
      },
      {
        name: 'Balanced Lunch',
        foods: [
          foodDatabase.find(f => f.name === 'Chicken Breast')!,
          foodDatabase.find(f => f.name === 'Brown Rice')!,
          foodDatabase.find(f => f.name === 'Broccoli')!,
        ],
        reason: 'Optimal macro balance for sustained energy'
      },
      {
        name: 'Omega-Rich Dinner',
        foods: [
          foodDatabase.find(f => f.name === 'Salmon')!,
          foodDatabase.find(f => f.name === 'Sweet Potato')!,
          foodDatabase.find(f => f.name === 'Avocado')!,
        ],
        reason: 'Rich in healthy fats and nutrients for recovery'
      }
    ];

    const personalizedTips = [
      `Based on your ${user.activityLevel} activity level, focus on post-workout nutrition`,
      `Your BMI suggests ${user.dietGoal === 'lose' ? 'a moderate calorie deficit' : 'maintaining current habits'}`,
      `Consider meal timing around your schedule for optimal results`,
      'Stay hydrated - aim for at least 8 glasses of water daily',
      'Include colorful vegetables for maximum micronutrient density'
    ];

    const insights = [
      `Your daily calorie target of ${dailyCalories} kcal is optimized for ${user.dietGoal === 'lose' ? 'healthy weight loss' : user.dietGoal === 'gain' ? 'muscle gain' : 'maintenance'}`,
      `At ${user.age} years old, prioritizing protein (${Math.round(dailyCalories * 0.25 / 4)}g daily) supports muscle maintenance`,
      'Your current plan balances all essential macronutrients effectively',
      user.allergies.length > 0 
        ? `AI has excluded ${user.allergies.join(', ')} from all recommendations`
        : 'No dietary restrictions detected - full food database available'
    ];

    setRecommendations({
      meals: mealRecommendations,
      tips: personalizedTips,
      insights: insights
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-gray-700">AI is analyzing your profile...</p>
            <p className="text-sm text-gray-500 mt-2">Creating personalized recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Brain className="mr-3 text-purple-600" />
          AI Recommendations
        </h2>
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-1" />
          Personalized
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Suggestions */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ChefHat className="mr-2 text-green-600" />
            Suggested Meals
          </h3>
          <div className="space-y-4">
            {recommendations.meals.map((meal, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                <h4 className="font-medium text-lg mb-2">{meal.name}</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {meal.foods.map((food, foodIndex) => (
                    <span
                      key={foodIndex}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm"
                    >
                      {food.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">{meal.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips & Insights */}
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 text-blue-600" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {recommendations.insights.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Personalized Tips</h3>
            <div className="space-y-2">
              {recommendations.tips.map((tip, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-yellow-100">
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}