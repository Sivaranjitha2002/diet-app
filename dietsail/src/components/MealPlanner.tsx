/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Meal, Food } from '../types';
import { Clock, Plus, Utensils, Search, X, Brain, Loader2 } from 'lucide-react';
import { ZCQL } from '@zcatalyst/zcql';
import { Datastore } from '@zcatalyst/datastore';

interface MealPlannerProps {
  meals: Meal[];
  onAddMeal: (meal: Omit<Meal, 'id'>) => void;
  onMealCompleted: (mealId: string, isCompleted: boolean, mealNutrition: any) => void;
  userId: string;
}

interface UserData {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  targetWeight?: number;
}

interface BMIData {
  value: number;
  category: string;
  status: 'underweight' | 'normal' | 'overweight' | 'obese';
}

interface FoodAnalysis {
  food: Food;
  calorieImpact: 'low' | 'moderate' | 'high' | 'excessive';
  recommendation: string;
  suggestedQuantity?: number;
  timeImpact?: string;
}

interface AIResponse {
  analysis: string;
  healthScore: number;
  alternatives: string[];
  nutritionInsights: string[];
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

export function MealPlanner({ meals, onAddMeal, onMealCompleted, userId }: MealPlannerProps) {
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<{ food: Food; quantity: number }[]>([]);
  const [mealName, setMealName] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [allFoods, setAllFoods] = useState<Record<string, any>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    mealName: string;
    scheduledTime: string;
    selectedFoods: string;
  }>({
    mealName: '',
    scheduledTime: '',
    selectedFoods: ''
  });
  const [completingMeal, setCompletingMeal] = useState<string | null>(null);
  
  // New AI-related state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis[]>([]);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [aiResponses, setAiResponses] = useState<Map<string, AIResponse>>(new Map());
  const [loadingAI, setLoadingAI] = useState<Set<string>>(new Set());
  const [usdaFoods, setUsdaFoods] = useState<USDAFoodItem[]>([]);

  React.useEffect(() => {
    async function fetchFoods() {
      const zcql = new ZCQL();
      const foods = await zcql.executeZCQLQuery('select * from foods');
      setAllFoods(foods as Record<string, any>[]);
    }
    fetchFoods();
    
    // Fetch user data for AI analysis
    if (userId) {
      fetchUserDataForAI();
    }
  }, [userId]);

  // Fetch user data and calculate BMI
  const fetchUserDataForAI = async () => {
    try {
      const zcql = new ZCQL();
      const userInfo = await zcql.executeZCQLQuery(
        `select * from users where id='${userId}'`
      );

      if (userInfo.length > 0) {
        const user = userInfo[0].users;
        const userData: UserData = {
          weight: parseFloat(user.weight || '70'),
          height: parseFloat(user.height || '170'),
          age: parseInt(user.age || '25'),
          gender: user.gender || 'female',
          activityLevel: user.activityLevel || 'moderate',
          targetWeight: parseFloat(user.targetWeight || user.weight)
        };
        
        setUserData(userData);
        
        // Calculate BMI
        const bmi = calculateBMI(userData.weight, userData.height);
        setBmiData(bmi);
        
        // Calculate target calories
        const calories = calculateTargetCalories(userData);
        setTargetCalories(calories);
      }
    } catch (error) {
      console.error('Error fetching user data for AI:', error);
    }
  };

  const calculateBMI = (weight: number, height: number): BMIData => {
    // Standard BMI formula from medical literature
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    
    // WHO BMI categories (not AI-generated)
    let category = '';
    let status: BMIData['status'] = 'normal';
    
    if (bmiValue < 18.5) {
      category = 'Underweight';
      status = 'underweight';
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      category = 'Normal weight';
      status = 'normal';
    } else if (bmiValue >= 25 && bmiValue < 30) {
      category = 'Overweight';
      status = 'overweight';
    } else {
      category = 'Obese';
      status = 'obese';
    }

    return { value: Math.round(bmiValue * 10) / 10, category, status };
  };

  const calculateTargetCalories = (user: UserData): number => {
    // Mifflin-St Jeor Equation (established formula from 1990)
    let bmr;
    if (user.gender === 'male') {
      bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
    } else {
      bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
    }

    // Activity factors from established research
    const activityFactors = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very-active': 1.9
    };

    const tdee = bmr * (activityFactors[user.activityLevel as keyof typeof activityFactors] || 1.55);
    
    // Adjust for weight goals
    if (user.targetWeight && user.targetWeight < user.weight) {
      return Math.round(tdee - 500); // Deficit for weight loss
    } else if (user.targetWeight && user.targetWeight > user.weight) {
      return Math.round(tdee + 300); // Surplus for weight gain
    }
    
    return Math.round(tdee);
  };

  // USDA FoodData Central API integration
  const searchUSDAFoods = async (query: string): Promise<USDAFoodItem[]> => {
    try {
      // For USDA API key, get free key from: https://fdc.nal.usda.gov/api-guide.html
      // Add REACT_APP_USDA_API_KEY=your_actual_key_here to your .env file
      const API_KEY = process.env.REACT_APP_USDA_API_KEY;
      
      // If no API key, return empty array (graceful degradation)
      if (!API_KEY || API_KEY === 'DEMO_KEY') {
        console.log('USDA API key not configured. Skipping USDA search.');
        return [];
      }
      
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${API_KEY}&pageSize=10`
      );
      
      if (!response.ok) {
        throw new Error('USDA API request failed');
      }
      
      const data = await response.json();
      return data.foods || [];
    } catch (error) {
      console.error('Error fetching USDA foods:', error);
      return [];
    }
  };

  // Main AI analysis function - consolidated
  const getAIAnalysis = async (food: Food, userProfile: UserData, bmi: BMIData): Promise<AIResponse> => {
    try {
      // 1. Try Hugging Face (if API key available)
      const HF_API_KEY = process.env.REACT_APP_HUGGING_FACE_API_KEY;
      if (HF_API_KEY && HF_API_KEY !== 'your_hugging_face_api_key_here' && HF_API_KEY !== 'DEMO_KEY') {
        try {
          return await getHuggingFaceAnalysis(food, userProfile, bmi);
        } catch (error) {
          console.log('Hugging Face API failed, falling back to rule-based analysis');
        }
      }
      
      // 2. Enhanced rule-based analysis (always available)
      return await getEnhancedRuleBasedAnalysis(food, userProfile, bmi);
      
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      return generateRuleBasedAnalysis(food, userProfile, bmi);
    }
  };

  // Hugging Face implementation
  const getHuggingFaceAnalysis = async (food: Food, userProfile: UserData, bmi: BMIData): Promise<AIResponse> => {
    const prompt = `Analyze nutrition for ${food.name} (${food.calories}cal/100g) for ${bmi.category} BMI user seeking ${userProfile.targetWeight < userProfile.weight ? 'weight loss' : 'maintenance'}. Brief analysis:`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_length: 100, temperature: 0.7 }
        }),
      }
    );

    if (!response.ok) throw new Error('HF API failed');
    
    const result = await response.json();
    const aiText = result[0]?.generated_text || '';
    
    return {
      analysis: aiText || `Smart analysis: ${food.name} provides ${food.calories} calories. Good for ${bmi.category} profile.`,
      healthScore: calculateHealthScore(food, bmi),
      alternatives: generateAlternatives(food),
      nutritionInsights: generateNutritionInsights(food, userProfile, bmi)
    };
  };

  // Enhanced rule-based analysis
  const getEnhancedRuleBasedAnalysis = async (food: Food, userProfile: UserData, bmi: BMIData): Promise<AIResponse> => {
    const proteinQuality = assessProteinQuality(food);
    const micronutrientDensity = assessMicronutrientDensity(food);
    const processingLevel = assessProcessingLevel(food);
    
    let analysis = `Nutritional Assessment: `;
    
    if (proteinQuality >= 80) {
      analysis += `High-quality protein source. `;
    }
    
    if (micronutrientDensity >= 70) {
      analysis += `Rich in essential nutrients. `;
    } else {
      analysis += `Consider pairing with nutrient-dense foods. `;
    }
    
    // BMI-specific advice
    if (bmi.status === 'overweight' || bmi.status === 'obese') {
      analysis += `For weight management: Focus on portion control and satiety.`;
    } else if (bmi.status === 'underweight') {
      analysis += `For healthy weight gain: Good calorie density.`;
    } else {
      analysis += `Fits well in a balanced diet for weight maintenance.`;
    }

    return {
      analysis,
      healthScore: calculateEnhancedHealthScore(food, bmi, proteinQuality, micronutrientDensity),
      alternatives: generateResearchBasedAlternatives(food),
      nutritionInsights: getDetailedNutritionInsights(food, userProfile, bmi)
    };
  };

  // Simple rule-based fallback
  const generateRuleBasedAnalysis = (food: Food, userProfile: UserData, bmi: BMIData): AIResponse => {
    const healthScore = calculateHealthScore(food, bmi);
    
    let analysis = '';
    if (healthScore >= 8) {
      analysis = `Excellent choice! This food is nutrient-dense with good protein (${food.protein}g) and fiber (${food.fiber}g) content.`;
    } else if (healthScore >= 6) {
      analysis = `Good option. Contains ${food.calories} calories with balanced macronutrients for your ${bmi.category} profile.`;
    } else {
      analysis = `Consider moderation. This food is calorie-dense. Focus on portion control for your ${bmi.category} status.`;
    }

    return {
      analysis,
      healthScore,
      alternatives: generateAlternatives(food),
      nutritionInsights: generateNutritionInsights(food, userProfile, bmi)
    };
  };

  // Helper functions for enhanced analysis
  const calculateHealthScore = (food: Food, bmi: BMIData): number => {
    let score = 5; // Base score
    
    // Protein content (higher is better)
    const proteinRatio = food.protein / food.calories * 100;
    if (proteinRatio > 20) score += 2;
    else if (proteinRatio > 10) score += 1;
    
    // Fiber content (higher is better)
    const fiberRatio = food.fiber / food.calories * 100;
    if (fiberRatio > 10) score += 2;
    else if (fiberRatio > 5) score += 1;
    
    // Calorie density (context-dependent)
    if (bmi.status === 'overweight' || bmi.status === 'obese') {
      if (food.calories < 200) score += 1;
      else if (food.calories > 400) score -= 1;
    } else if (bmi.status === 'underweight') {
      if (food.calories > 300) score += 1;
    }
    
    return Math.max(1, Math.min(10, score));
  };

  const assessProteinQuality = (food: Food): number => {
    let score = 50;
    
    if (food.protein > 20) score += 30;
    else if (food.protein > 10) score += 20;
    else if (food.protein < 5) score -= 20;
    
    const category = food.category.toLowerCase();
    if (category.includes('meat') || category.includes('dairy') || category.includes('egg') || food.name.toLowerCase().includes('quinoa')) {
      score += 20;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const assessMicronutrientDensity = (food: Food): number => {
    let score = 40;
    
    const category = food.category.toLowerCase();
    
    if (category.includes('vegetable') || category.includes('fruit')) score += 40;
    else if (category.includes('whole grain') || food.fiber > 5) score += 25;
    else if (category.includes('meat') || category.includes('fish')) score += 20;
    else if (category.includes('processed') || category.includes('refined')) score -= 30;
    
    if (food.fiber > 10) score += 20;
    else if (food.fiber > 5) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const assessProcessingLevel = (food: Food): number => {
    let score = 70;
    
    const name = food.name.toLowerCase();
    const category = food.category.toLowerCase();
    
    if (name.includes('processed') || name.includes('refined') || name.includes('instant')) score -= 40;
    else if (category.includes('snack') || category.includes('dessert')) score -= 30;
    else if (name.includes('canned') || name.includes('frozen')) score -= 10;
    
    if (name.includes('fresh') || name.includes('raw') || name.includes('whole')) score += 20;
    
    return Math.max(0, Math.min(100, score));
  };

  const calculateEnhancedHealthScore = (food: Food, bmi: BMIData, proteinQuality: number, micronutrientDensity: number): number => {
    const proteinScore = proteinQuality / 100 * 2;
    const micronutrientScore = micronutrientDensity / 100 * 2;
    const basicHealthScore = calculateHealthScore(food, bmi);
    
    const score = (proteinScore + micronutrientScore + (basicHealthScore * 0.6));
    
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const generateAlternatives = (food: Food): string[] => {
    const alternatives = [];
    const category = food.category.toLowerCase();
    
    if (category.includes('meat')) {
      alternatives.push('Lean chicken breast', 'Fish (salmon/tuna)', 'Tofu or tempeh');
    } else if (category.includes('dairy')) {
      alternatives.push('Greek yogurt', 'Low-fat cottage cheese', 'Plant-based milk');
    } else if (category.includes('grain')) {
      alternatives.push('Quinoa', 'Brown rice', 'Whole wheat pasta');
    } else {
      alternatives.push('Fresh vegetables', 'Lean proteins', 'Whole grains');
    }
    
    return alternatives.slice(0, 3);
  };

  const generateResearchBasedAlternatives = (food: Food): string[] => {
    const alternatives = [];
    const category = food.category.toLowerCase();
    
    if (category.includes('meat') || food.protein > 15) {
      alternatives.push('Legumes (lentils, chickpeas)', 'Greek yogurt (probiotics)', 'Quinoa (complete protein)');
    } else if (category.includes('grain') || food.carbs > 20) {
      alternatives.push('Steel-cut oats (fiber)', 'Sweet potato (beta-carotene)', 'Brown rice (B vitamins)');
    } else if (category.includes('dairy') || food.fat > 10) {
      alternatives.push('Cottage cheese (casein protein)', 'Almond milk (vitamin E)', 'Avocado (healthy fats)');
    } else if (food.calories > 300) {
      alternatives.push('Leafy greens (micronutrients)', 'Berries (antioxidants)', 'Lean fish (omega-3)');
    } else {
      alternatives.push('Whole grains', 'Lean proteins', 'Colorful vegetables');
    }
    
    return alternatives.slice(0, 3);
  };

  const generateNutritionInsights = (food: Food, userProfile: UserData, bmi: BMIData): string[] => {
    const insights = [];
    
    const caloriesPer100g = food.calories;
    if (caloriesPer100g > 400) {
      insights.push(`High calorie density (${caloriesPer100g}/100g) - consider smaller portions`);
    } else if (caloriesPer100g < 100) {
      insights.push(`Low calorie density (${caloriesPer100g}/100g) - great for volume eating`);
    }
    
    if (food.protein > 20) {
      insights.push(`Excellent protein source (${food.protein}g/100g) - supports muscle maintenance`);
    } else if (food.protein < 5) {
      insights.push(`Low protein content - pair with protein-rich foods`);
    }
    
    if (bmi.status === 'overweight' || bmi.status === 'obese') {
      insights.push(`For weight loss: Focus on portion control and pair with vegetables`);
    } else if (bmi.status === 'underweight') {
      insights.push(`For weight gain: Good choice, consider increasing portion size`);
    }
    
    return insights.slice(0, 3);
  };

  const getDetailedNutritionInsights = (food: Food, userProfile: UserData, bmi: BMIData): string[] => {
    const insights = [];
    
    const proteinFiberScore = food.protein + food.fiber;
    if (proteinFiberScore > 15) {
      insights.push('High satiety index - helps control hunger between meals');
    } else if (proteinFiberScore < 5) {
      insights.push('Low satiety - consider adding protein or fiber sources');
    }
    
    if (food.protein > 20) {
      insights.push('High thermic effect - increases metabolism by 20-30%');
    }
    
    if (food.fiber > 10) {
      insights.push('Excellent for gut health and blood sugar control');
    }
    
    if (food.name.toLowerCase().includes('whole') || food.fiber > 5) {
      insights.push('Minimally processed - retains natural nutrients');
    }
    
    if (bmi.status === 'overweight' || bmi.status === 'obese') {
      const calorieToNutrientRatio = food.calories / (food.protein + food.fiber + 1);
      if (calorieToNutrientRatio < 15) {
        insights.push('Excellent nutrient-to-calorie ratio for weight management');
      }
    } else if (bmi.status === 'underweight') {
      if (food.calories > 250) {
        insights.push('Good calorie density for healthy weight gain');
      }
    }
    
    return insights.slice(0, 3);
  };

  const getMealTargetCalories = (): number => {
    const mealDistribution = {
      'breakfast': 0.25,
      'lunch': 0.35,
      'dinner': 0.30,
      'snack': 0.10
    };
    
    return Math.round(targetCalories * mealDistribution[selectedMealType]);
  };

  // Enhanced food analysis with AI
  const analyzeFood = async (food: Food, quantity: number = 100): Promise<FoodAnalysis> => {
    if (!userData || !bmiData || !targetCalories) {
      return {
        food,
        calorieImpact: 'moderate',
        recommendation: 'Loading nutritional analysis...'
      };
    }

    const foodId = food.id;
    setLoadingAI(prev => new Set([...prev, foodId]));

    try {
      let aiResponse = aiResponses.get(foodId);
      if (!aiResponse) {
        aiResponse = await getAIAnalysis(food, userData, bmiData);
        setAiResponses(prev => new Map([...prev, [foodId, aiResponse]]));
      }

      const caloriesPerServing = (food.calories * quantity) / 100;
      const mealTargetCalories = getMealTargetCalories();
      const caloriePercentage = (caloriesPerServing / mealTargetCalories) * 100;

      let impact: FoodAnalysis['calorieImpact'];
      let recommendation: string;
      let suggestedQuantity: number | undefined;
      let timeImpact: string | undefined;

      if (caloriePercentage > 80) {
        impact = 'excessive';
        suggestedQuantity = Math.round((mealTargetCalories * 0.6 / food.calories) * 100);
        recommendation = `🤖 AI Analysis: ${aiResponse.analysis} | Health Score: ${aiResponse.healthScore}/10. This portion (${Math.round(caloriesPerServing)} cal) exceeds your meal target. Try ${suggestedQuantity}g instead.`;
        timeImpact = `Based on your BMI, this could delay weight goals by 1-2 weeks.`;
      } else if (caloriePercentage > 60) {
        impact = 'high';
        recommendation = `🤖 AI Analysis: ${aiResponse.analysis} | Health Score: ${aiResponse.healthScore}/10. Moderate-high calories (${Math.round(caloriesPerServing)}). Consider these alternatives: ${aiResponse.alternatives.join(', ')}.`;
      } else if (caloriePercentage > 30) {
        impact = 'moderate';
        recommendation = `🤖 AI Analysis: ${aiResponse.analysis} | Health Score: ${aiResponse.healthScore}/10. Good portion size for your goals.`;
      } else {
        impact = 'low';
        recommendation = `🤖 AI Analysis: ${aiResponse.analysis} | Health Score: ${aiResponse.healthScore}/10. Excellent low-calorie choice!`;
      }

      return {
        food,
        calorieImpact: impact,
        recommendation,
        suggestedQuantity,
        timeImpact
      };

    } catch (error) {
      console.error('Error in AI food analysis:', error);
      return generateRuleBasedFoodAnalysis(food, quantity);
    } finally {
      setLoadingAI(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(foodId);
        return newSet;
      });
    }
  };

  const generateRuleBasedFoodAnalysis = (food: Food, quantity: number): FoodAnalysis => {
    const caloriesPerServing = (food.calories * quantity) / 100;
    const mealTargetCalories = getMealTargetCalories();
    const caloriePercentage = (caloriesPerServing / mealTargetCalories) * 100;

    let impact: FoodAnalysis['calorieImpact'] = 'moderate';
    let recommendation = `Nutritional analysis: ${food.calories} calories per 100g. Consider your portion size.`;

    if (caloriePercentage > 80) impact = 'excessive';
    else if (caloriePercentage > 60) impact = 'high';
    else if (caloriePercentage > 30) impact = 'moderate';
    else impact = 'low';

    return { food, calorieImpact: impact, recommendation };
  };

  // Enhanced search with USDA integration
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length > 2) {
      try {
        const usdaResults = await searchUSDAFoods(query);
        setUsdaFoods(usdaResults);
      } catch (error) {
        console.error('Error searching USDA foods:', error);
      }
    } else {
      setUsdaFoods([]);
    }
  };

  // Convert USDA food to our Food format
  const convertUSDAToFood = (usdaFood: USDAFoodItem): Food => {
    const nutrients = usdaFood.foodNutrients;
    
    const getMetric = (nutrientIds: number[]) => {
      const nutrient = nutrients.find(n => nutrientIds.includes(n.nutrientId));
      return nutrient ? nutrient.value : 0;
    };

    return {
      id: `usda-${usdaFood.fdcId}`,
      name: usdaFood.description,
      category: 'USDA Database',
      calories: getMetric([1008]), // Energy
      protein: getMetric([1003]), // Protein
      carbs: getMetric([1005]), // Carbohydrate
      fat: getMetric([1004]), // Total lipid (fat)
      fiber: getMetric([1079]) // Fiber
    };
  };

  // Update addFoodToMeal to use async AI analysis
  const addFoodToMeal = async (food: Food) => {
    const existingFood = selectedFoods.find(item => item.food.id === food.id);
    let newQuantity = 100;
    
    if (existingFood) {
      newQuantity = existingFood.quantity + 100;
      setSelectedFoods(selectedFoods.map(item =>
        item.food.id === food.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setSelectedFoods([...selectedFoods, { food, quantity: newQuantity }]);
    }
    
    // Generate AI analysis for the food (async)
    const analysis = await analyzeFood(food, newQuantity);
    setFoodAnalysis(prev => {
      const filtered = prev.filter(item => item.food.id !== food.id);
      return [...filtered, analysis];
    });
    
    // Clear foods validation error when food is added
    if (validationErrors.selectedFoods) {
      setValidationErrors(prev => ({ ...prev, selectedFoods: '' }));
    }
  };

  // Update quantity change to refresh AI analysis
  const updateFoodQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedFoods(selectedFoods.filter(item => item.food.id !== foodId));
      setFoodAnalysis(prev => prev.filter(item => item.food.id !== foodId));
    } else {
      setSelectedFoods(selectedFoods.map(item =>
        item.food.id === foodId ? { ...item, quantity } : item
      ));
      
      // Update AI analysis for the changed quantity
      const food = selectedFoods.find(item => item.food.id === foodId)?.food;
      if (food) {
        const analysis = analyzeFood(food, quantity);
        setFoodAnalysis(prev => {
          const filtered = prev.filter(item => item.food.id !== foodId);
          return [...filtered, analysis];
        });
      }
    }
  };

  const validateForm = () => {
    const errors = {
      mealName: '',
      scheduledTime: '',
      selectedFoods: ''
    };

    // Validate meal name
    if (!mealName.trim()) {
      errors.mealName = 'Meal name is required';
    } else if (mealName.trim().length < 3) {
      errors.mealName = 'Meal name must be at least 3 characters long';
    }

    // Validate scheduled time
    if (!scheduledTime) {
      errors.scheduledTime = 'Scheduled time is required';
    }

    // Validate selected foods
    if (selectedFoods.length === 0) {
      errors.selectedFoods = 'At least one food item must be selected';
    }

    setValidationErrors(errors);
    return !errors.mealName && !errors.scheduledTime && !errors.selectedFoods;
  };

  // Clear validation error when user starts typing
  const handleMealNameChange = (value: string) => {
    setMealName(value);
    if (validationErrors.mealName) {
      setValidationErrors(prev => ({ ...prev, mealName: '' }));
    }
  };

  const handleScheduledTimeChange = (value: string) => {
    setScheduledTime(value);
    if (validationErrors.scheduledTime) {
      setValidationErrors(prev => ({ ...prev, scheduledTime: '' }));
    }
  };

  const filteredFoods = allFoods
    .map((food) => food.foods)
    .filter((food: Food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const removeFoodFromMeal = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter(item => item.food.id !== foodId));
    setFoodAnalysis(prev => prev.filter(item => item.food.id !== foodId));
    
    // Clear foods validation error if no foods are selected after removal
    if (selectedFoods.length === 1) { // Will be 0 after removal
      setValidationErrors(prev => ({ ...prev, selectedFoods: 'At least one food item must be selected' }));
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
    // Validate form before creating meal
    if (!validateForm()) {
      return; // Stop execution if validation fails
    }

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
    
    // Reset form and clear validation errors
    setMealName('');
    setScheduledTime('');
    setSelectedFoods([]);
    setSearchQuery('');
    setFoodAnalysis([]);
    setValidationErrors({
      mealName: '',
      scheduledTime: '',
      selectedFoods: ''
    });
  };

  // Meal completion handlers
  const handleMealCompletion = async (meal: Meal) => {
    if (!userId) {
      console.error('User ID is required for meal completion');
      return;
    }

    setCompletingMeal(meal.id);

    try {
      const datastore = new Datastore();

      const totalNutrition = {
        calories: meal.totalCalories,
        protein: meal.totalProtein,
        carbs: meal.totalCarbs,
        fat: meal.totalFat,
        fiber: meal.totalFiber || 0
      };

      await updateDailyNutrition(meal.id, totalNutrition);
      await updateWeightProjection(userId, totalNutrition.calories);

      const zcql = new ZCQL();
      const mealRecord = await zcql.executeZCQLQuery(
        `select * from meals where id='${meal.id}'`
      );

      if (mealRecord.length > 0) {
        await datastore.table('meals').updateRow({
          ROWID: mealRecord[0].meals.ROWID,
          completed: true
        } as any);
      }

      onMealCompleted(meal.id, true, totalNutrition);

      console.log('Meal completed successfully:', meal.name);
    } catch (error) {
      console.error('Error completing meal:', error);
    } finally {
      setCompletingMeal(null);
    }
  };

  const updateDailyNutrition = async (mealId: string, nutrition: any) => {
    try {
      const datastore = new Datastore();
      const zcql = new ZCQL();

      const existingRecord = await zcql.executeZCQLQuery(
        `select * from meals where id='${mealId}'`
      );

      if (existingRecord.length > 0) {
        const current = existingRecord[0].meals;
        await datastore.table('meals').updateRow({
          ROWID: current.ROWID,
          totalCalories: (current.totalCalories || 0) + nutrition.calories,
          totalProtein: (current.totalProtein || 0) + nutrition.protein,
          totalCarbs: (current.totalCarbs || 0) + nutrition.carbs,
          totalFat: (current.totalFat || 0) + nutrition.fat,
          totalFiber: (current.totalFiber || 0) + nutrition.fiber,
          scheduledTime: new Date().toISOString()
        } as any);
      }
    } catch (error) {
      console.error('Error updating daily nutrition:', error);
    }
  };

  const updateWeightProjection = async (userId: string, caloriesConsumed: number) => {
    try {
      const datastore = new Datastore();
      const zcql = new ZCQL();

      const userInfo = await zcql.executeZCQLQuery(
        `select * from users where id='${userId}'`
      );

      if (userInfo.length === 0) return;

      const user = userInfo[0].users;
      const currentWeight = parseFloat(user.weight || '0');
      const height = parseFloat(user.height || '0');
      const age = parseInt(user.age || '0');
      const gender = user.gender || 'female';
      const activityLevel = user.activityLevel || 'moderate';

      let bmr;
      if (gender === 'male') {
        bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age);
      }

      const activityFactors = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very-active': 1.9
      };
      const dailyCalorieNeeds = bmr * (activityFactors[activityLevel as keyof typeof activityFactors] || 1.55);
      const calorieBalance = caloriesConsumed - dailyCalorieNeeds;
      const weightChangeKg = calorieBalance / 7700;
      const projectedWeight = currentWeight + weightChangeKg;

      await datastore.table('users').updateRow({
        ROWID: user.ROWID,
        weight: projectedWeight,
        gainedWeight: weightChangeKg,
      });
    } catch (error) {
      console.error('Error updating weight projection:', error);
    }
  };

  const filteredMeals = meals.filter(meal => !meal.completed || meal.completed === 'false');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Utensils className="mr-3 text-green-600" />
          Meal Planner
        </h2>
        {bmiData && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700">BMI: {bmiData.value} ({bmiData.category})</span>
            </div>
            <button
              onClick={() => setShowAIRecommendations(!showAIRecommendations)}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
            >
              {/* <Brain className="h-4 w-4" />
              <span>AI Assistant</span> */}
            </button>
          </div>
        )}
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
                onChange={(e) => handleMealNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  validationErrors.mealName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Grilled Chicken Bowl"
              />
              {validationErrors.mealName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.mealName}</p>
              )}
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
                  onChange={(e) => handleScheduledTimeChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    validationErrors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.scheduledTime && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.scheduledTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Food Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Foods <span className="text-xs text-purple-600">(Powered by USDA Database)</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search foods from USDA database..."
              />
            </div>
            {validationErrors.selectedFoods && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.selectedFoods}</p>
            )}
          </div>

          {/* Enhanced Food Results with USDA data */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {/* Local foods */}
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
            
            {/* USDA foods */}
            {usdaFoods.map((usdaFood) => {
              const food = convertUSDAToFood(usdaFood);
              return (
                <div
                  key={food.id}
                  className="p-3 border-b border-gray-100 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                  onClick={() => addFoodToMeal(food)}
                >
                  <div>
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-purple-600">USDA Database • {food.calories} kcal/100g</div>
                  </div>
                  <Plus className="h-5 w-5 text-purple-600" />
                </div>
              );
            })}
          </div>

          {/* Enhanced Selected Foods with AI Analysis */}
          {selectedFoods.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Selected Foods</h4>
              <div className="space-y-2">
                {selectedFoods.map((item) => {
                  const analysis = foodAnalysis.find(a => a.food.id === item.food.id);
                  const isLoading = loadingAI.has(item.food.id);
                  const aiResponse = aiResponses.get(item.food.id);
                  
                  return (
                    <div key={item.food.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
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
                          <button
                            onClick={() => removeFoodFromMeal(item.food.id)}
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                            title="Remove food"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Enhanced AI Analysis with loading state */}
                      {showAIRecommendations && userData && (
                        <div className={`mt-2 p-2 rounded text-xs ${
                          analysis?.calorieImpact === 'excessive' ? 'bg-red-50 border border-red-200' :
                          analysis?.calorieImpact === 'high' ? 'bg-yellow-50 border border-yellow-200' :
                          analysis?.calorieImpact === 'moderate' ? 'bg-blue-50 border border-blue-200' :
                          'bg-green-50 border border-green-200'
                        }`}>
                          <div className="flex items-center space-x-1 mb-1">
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Brain className="h-3 w-3" />
                            )}
                            <span className="font-medium">
                              {isLoading ? 'AI Analyzing...' : 'AI Analysis:'}
                            </span>
                          </div>
                          
                          {analysis && !isLoading && (
                            <>
                              <p>{analysis.recommendation}</p>
                              {analysis.timeImpact && (
                                <p className="mt-1 font-medium text-red-600">{analysis.timeImpact}</p>
                              )}
                              {analysis.suggestedQuantity && (
                                <button
                                  onClick={() => updateFoodQuantity(item.food.id, analysis.suggestedQuantity!)}
                                  className="mt-1 px-2 py-1 bg-white border rounded text-xs hover:bg-gray-50"
                                >
                                  Use AI suggested {analysis.suggestedQuantity}g
                                </button>
                              )}
                              
                              {/* Display AI insights */}
                              {aiResponse && aiResponse.nutritionInsights.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="font-medium text-purple-700">💡 Nutrition Insights:</p>
                                  {aiResponse.nutritionInsights.map((insight, index) => (
                                    <p key={index} className="text-xs mt-1">• {insight}</p>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Enhanced Meal Nutrition Summary */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium mb-2">Meal Nutrition Summary</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Calories: {Math.round(calculateMealNutrition().calories)}</div>
                  <div>Protein: {Math.round(calculateMealNutrition().protein * 10) / 10}g</div>
                  <div>Carbs: {Math.round(calculateMealNutrition().carbs * 10) / 10}g</div>
                  <div>Fat: {Math.round(calculateMealNutrition().fat * 10) / 10}g</div>
                </div>
                
                {/* AI Overall Meal Assessment */}
                {showAIRecommendations && targetCalories > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="text-xs">
                      <span className="font-medium">Target for {selectedMealType}: </span>
                      {getMealTargetCalories()} calories
                    </div>
                    <div className="text-xs mt-1">
                      <span className="font-medium">Current meal: </span>
                      {Math.round(calculateMealNutrition().calories)} calories 
                      {calculateMealNutrition().calories > getMealTargetCalories() * 1.2 ? 
                        ' ⚠️ Over target' : 
                        calculateMealNutrition().calories < getMealTargetCalories() * 0.6 ? 
                        ' 💡 Under target' : 
                        ' ✅ Good range'}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCreateMeal}
                disabled={!mealName.trim() || !scheduledTime || selectedFoods.length === 0}
                className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors duration-200 ${
                  !mealName.trim() || !scheduledTime || selectedFoods.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
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
            {filteredMeals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No meals planned yet</p>
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-2 pr-24">
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
                  
                  {/* Show foods in the meal */}
                  {meal.foods && meal.foods.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Foods:</p>
                      <div className="text-xs text-gray-600">
                        {
                          (() => {
                            let foodsArr: any[] = [];
                            if (Array.isArray(meal.foods)) {
                              foodsArr = meal.foods;
                            } else if (typeof meal.foods === 'string') {
                              try {
                                const parsed = JSON.parse(JSON.stringify(meal.foods));
                                foodsArr = Array.isArray(parsed) ? parsed : [];
                              } catch {
                                foodsArr = [];
                              }
                            }
                            return foodsArr.map((item, index, arr) => (
                              <span key={item.food?.id || index}>
                                {item.food?.name || ''} ({item.quantity}g)
                                {index < arr.length - 1 ? ', ' : ''}
                              </span>
                            ));
                          })()
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Completion Checkbox */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleMealCompletion(meal);
                          } else {
                            onMealCompleted(meal.id, false, {
                              calories: meal.totalCalories,
                              protein: meal.totalProtein,
                              carbs: meal.totalCarbs,
                              fat: meal.totalFat,
                              fiber: meal.totalFiber || 0
                            });
                          }
                        }}
                        disabled={completingMeal === meal.id}
                        className="w-5 h-5 text-green-600 border-2 border-green-500 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600">Completed</span>
                    </label>
                    
                    {/* Loading indicator when processing */}
                    {completingMeal === meal.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Show completed meals count if any */}
          {console.log('Completed meals:', meals)}
          {meals.filter(meal => meal.completed === true).length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ {meals.filter(meal => meal.completed === true).length} meal(s) completed today
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}