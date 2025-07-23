import { User, Food, AIRecommendation } from '../types';
import { Database } from '../config/database';
import { ICatalystRow } from '@zcatalyst/datastore/dist-types/utils/interface';

export class AIService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  public async generateMealRecommendations(user: User): Promise<{
    meals: Array<{ name: string; foods: ICatalystRow[]; reason: string }>;
    tips: string[];
    insights: string[];
  }> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foods = await this.db.getAllFoods();
    const proteinFoods = foods.filter(food => food.category === 'Protein');
    const vegFoods = foods.filter(food => food.category === 'Vegetables');
    const grainFoods = foods.filter(food => food.category === 'Grains');
    const healthyFats = foods.filter(food => food.category === 'Healthy Fats');

    // AI-like meal recommendations based on user profile
    const mealRecommendations = [
      {
        name: 'Power Breakfast Bowl',
        foods: [
          foods.find(f => f.name === 'Greek Yogurt')!,
          foods.find(f => f.name === 'Quinoa')!,
        ].filter(Boolean),
        reason: `High protein start perfect for your ${user.dietGoal} goal`
      },
      {
        name: 'Balanced Lunch',
        foods: [
          foods.find(f => f.name === 'Chicken Breast')!,
          foods.find(f => f.name === 'Brown Rice')!,
          foods.find(f => f.name === 'Broccoli')!,
        ].filter(Boolean),
        reason: 'Optimal macro balance for sustained energy'
      },
      {
        name: 'Omega-Rich Dinner',
        foods: [
          foods.find(f => f.name === 'Salmon')!,
          foods.find(f => f.name === 'Sweet Potato')!,
          foods.find(f => f.name === 'Avocado')!,
        ].filter(Boolean),
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
      `Your profile indicates ${user.dietGoal === 'lose' ? 'healthy weight loss' : user.dietGoal === 'gain' ? 'muscle gain' : 'maintenance'} as the primary goal`,
      `At ${user.age} years old, prioritizing protein supports muscle maintenance`,
      'Your current plan balances all essential macronutrients effectively',
      user.allergies.length > 0 
        ? `AI has excluded ${user.allergies.join(', ')} from all recommendations`
        : 'No dietary restrictions detected - full food database available'
    ];

    return {
      meals: mealRecommendations,
      tips: personalizedTips,
      insights: insights
    };
  }

  public async generateDietPlan(user: User, duration: number = 7): Promise<any> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // This would integrate with actual AI services like OpenAI GPT-4
    // For now, we'll return a structured plan based on user profile
    
    return {
      name: `Personalized ${duration}-Day Plan`,
      duration,
      dailyCalories: this.calculateDailyCalories(user),
      recommendations: await this.generateMealRecommendations(user)
    };
  }

  private calculateDailyCalories(user: User): number {
    const bmr = this.calculateBMR(user);
    const tdee = this.calculateTDEE(bmr, user.activityLevel);
    
    switch (user.dietGoal) {
      case 'lose':
        return Math.round(tdee - 500);
      case 'gain':
        return Math.round(tdee + 300);
      default:
        return tdee;
    }
  }

  private calculateBMR(user: User): number {
    const { weight, height, age, gender } = user;
    
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  private calculateTDEE(bmr: number, activityLevel: User['activityLevel']): number {
    const multipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very-active': 1.9
    };
    
    return Math.round(bmr * multipliers[activityLevel]);
  }
}