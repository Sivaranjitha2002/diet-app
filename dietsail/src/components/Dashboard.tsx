import React from 'react';
import { User, NutritionGoals } from '../types';
import { calculateBMI, getBMICategory } from '../utils/calculations';
import { Target, TrendingUp, Activity, Droplets } from 'lucide-react';

interface DashboardProps {
  user: User;
  nutritionGoals: NutritionGoals;
  todayProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
  };
}

export function Dashboard({ user, nutritionGoals, todayProgress }: DashboardProps) {
  const bmi = calculateBMI(user.weight, user.height);
  const bmiCategory = getBMICategory(bmi);
  
  const progressPercentages = {
    calories: Math.min((todayProgress.calories / nutritionGoals.calories) * 100, 100),
    protein: Math.min((todayProgress.protein / nutritionGoals.protein) * 100, 100),
    carbs: Math.min((todayProgress.carbs / nutritionGoals.carbs) * 100, 100),
    fat: Math.min((todayProgress.fat / nutritionGoals.fat) * 100, 100),
    fiber: Math.min((todayProgress.fiber / nutritionGoals.fiber) * 100, 100),
    water: Math.min((todayProgress.water / nutritionGoals.water) * 100, 100),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* BMI Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">BMI Status</h3>
          <Target className="h-6 w-6 text-blue-500" />
        </div>
        <div className="text-3xl font-bold text-blue-600 mb-2">{bmi}</div>
        <div className="text-sm text-gray-600">{bmiCategory}</div>
        <div className="mt-4 text-xs text-gray-500">
          Target: {user.targetWeight}kg ({Math.abs(user.weight - user.targetWeight).toFixed(1)}kg to go)
        </div>
      </div>

      {/* Calories Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Daily Calories</h3>
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">
          {todayProgress.calories}
        </div>
        <div className="text-sm text-gray-600">of {nutritionGoals.calories} kcal</div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentages.calories}%` }}
          ></div>
        </div>
      </div>

      {/* Water Intake Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-cyan-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Water Intake</h3>
          <Droplets className="h-6 w-6 text-cyan-500" />
        </div>
        <div className="text-3xl font-bold text-cyan-600 mb-2">
          {(todayProgress.water / 1000).toFixed(1)}L
        </div>
        <div className="text-sm text-gray-600">of {(nutritionGoals.water / 1000).toFixed(1)}L</div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentages.water}%` }}
          ></div>
        </div>
      </div>

      {/* Macronutrients Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 col-span-1 md:col-span-2 lg:col-span-3 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Macronutrient Breakdown</h3>
          <Activity className="h-6 w-6 text-purple-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{todayProgress.protein}g</div>
            <div className="text-sm text-gray-600 mb-2">Protein</div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentages.protein}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Goal: {nutritionGoals.protein}g</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{todayProgress.carbs}g</div>
            <div className="text-sm text-gray-600 mb-2">Carbs</div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentages.carbs}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Goal: {nutritionGoals.carbs}g</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{todayProgress.fat}g</div>
            <div className="text-sm text-gray-600 mb-2">Fat</div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentages.fat}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Goal: {nutritionGoals.fat}g</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{todayProgress.fiber}g</div>
            <div className="text-sm text-gray-600 mb-2">Fiber</div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentages.fiber}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Goal: {nutritionGoals.fiber}g</div>
          </div>
        </div>
      </div>
    </div>
  );
}