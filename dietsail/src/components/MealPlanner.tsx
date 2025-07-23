import React, { useState } from 'react';
import { Meal, Food } from '../types';
import { foodDatabase } from '../data/foods';
import { Clock, Plus, Utensils, Search } from 'lucide-react';

interface MealPlannerProps {
  meals: Meal[];
  onAddMeal: (meal: Omit<Meal, 'id'>) => void;
}

export function MealPlanner({ meals, onAddMeal }: MealPlannerProps) {
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<{ food: Food; quantity: number }[]>([]);
  const [mealName, setMealName] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFoodToMeal = (food: Food) => {
    const existingFood = selectedFoods.find(item => item.food.id === food.id);
    if (existingFood) {
      setSelectedFoods(selectedFoods.map(item =>
        item.food.id === food.id
          ? { ...item, quantity: item.quantity + 100 }
          : item
      ));
    } else {
      setSelectedFoods([...selectedFoods, { food, quantity: 100 }]);
    }
  };

  const updateFoodQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedFoods(selectedFoods.filter(item => item.food.id !== foodId));
    } else {
      setSelectedFoods(selectedFoods.map(item =>
        item.food.id === foodId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateMealNutrition = () => {
    return selectedFoods.reduce((total, item) => {
      const multiplier = item.quantity / 100;
      return {
        calories: total.calories + (item.food.calories * multiplier),
        protein: total.protein + (item.food.protein * multiplier),
        carbs: total.carbs + (item.food.carbs * multiplier),
        fat: total.fat + (item.food.fat * multiplier),
        fiber: total.fiber + (item.food.fiber * multiplier)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const handleCreateMeal = () => {
    if (!mealName || !scheduledTime || selectedFoods.length === 0) return;

    const nutrition = calculateMealNutrition();
    const newMeal: Omit<Meal, 'id'> = {
      name: mealName,
      type: selectedMealType,
      foods: selectedFoods,
      totalCalories: Math.round(nutrition.calories),
      totalProtein: Math.round(nutrition.protein * 10) / 10,
      totalCarbs: Math.round(nutrition.carbs * 10) / 10,
      totalFat: Math.round(nutrition.fat * 10) / 10,
      totalFiber: Math.round(nutrition.fiber * 10) / 10,
      scheduledTime
    };

    onAddMeal(newMeal);
    
    // Reset form
    setMealName('');
    setScheduledTime('');
    setSelectedFoods([]);
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Utensils className="mr-3 text-green-600" />
          Meal Planner
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create New Meal */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Create New Meal</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Grilled Chicken Bowl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Food Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Foods</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search foods..."
              />
            </div>
          </div>

          {/* Food Results */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => addFoodToMeal(food)}
              >
                <div>
                  <div className="font-medium">{food.name}</div>
                  <div className="text-sm text-gray-500">{food.category} • {food.calories} kcal/100g</div>
                </div>
                <Plus className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Selected Foods</h4>
              <div className="space-y-2">
                {selectedFoods.map((item) => (
                  <div key={item.food.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.food.name}</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((item.food.calories * item.quantity) / 100)} kcal
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateFoodQuantity(item.food.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="0"
                      />
                      <span className="text-sm text-gray-500">g</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Meal Nutrition Summary */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium mb-2">Meal Nutrition</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Calories: {Math.round(calculateMealNutrition().calories)}</div>
                  <div>Protein: {Math.round(calculateMealNutrition().protein * 10) / 10}g</div>
                  <div>Carbs: {Math.round(calculateMealNutrition().carbs * 10) / 10}g</div>
                  <div>Fat: {Math.round(calculateMealNutrition().fat * 10) / 10}g</div>
                </div>
              </div>
              
              <button
                onClick={handleCreateMeal}
                className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Create Meal
              </button>
            </div>
          )}
        </div>

        {/* Today's Meals */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
          <div className="space-y-4">
            {meals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No meals planned yet</p>
              </div>
            ) : (
              meals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-lg">{meal.name}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {meal.scheduledTime}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 capitalize">{meal.type}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: {meal.totalCalories}</div>
                    <div>Protein: {meal.totalProtein}g</div>
                    <div>Carbs: {meal.totalCarbs}g</div>
                    <div>Fat: {meal.totalFat}g</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}