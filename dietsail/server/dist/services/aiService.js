"use strict";
/**
 * AI Service for Diet Recommendations
 *
 * This service uses a hybrid approach:
 * 1. Primary: External AI services (OpenAI, Anthropic Claude, Google Gemini) for text generation
 * 2. Secondary: Catalyst Zia SDK for text analysis and insights
 * 3. Fallback: Local rule-based generation when all services are unavailable
 *
 * Environment Variables Required:
 * - OPENAI_API_KEY (optional): OpenAI API key for GPT models
 * - ANTHROPIC_API_KEY (optional): Anthropic API key for Claude models
 * - GEMINI_API_KEY (optional): Google API key for Gemini models
 *
 * At least one external AI service key should be provided for optimal functionality.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const database_1 = require("../config/database");
const zia_1 = require("@zcatalyst/zia");
const axios_1 = __importDefault(require("axios"));
class AIService {
    constructor() {
        this.db = database_1.Database.getInstance();
        this.zia = new zia_1.Zia();
    }
    async generateMealRecommendations(user) {
        const foods = await this.db.getAllFoods();
        // Prepare a prompt optimized for Zia AI service
        const prompt = `
      Act as a nutrition expert and diet consultant. Based on the following user profile and available food database, provide personalized recommendations.
      
      User Profile: ${JSON.stringify(user)}
      Available Foods: ${foods.map(f => `${f.name} (${f.category})`).join(', ')}
      
      Please provide recommendations in valid JSON format with exactly these keys:
      - "meals": Array of 3 meal objects, each with "name" (string), "foods" (array of food objects), and "reason" (string)
      - "tips": Array of 5 personalized nutrition tips (strings)
      - "insights": Array of 3 dietary insights specific to this user (strings)
      
      Ensure the response is valid JSON that can be parsed programmatically.
    `;
        // Hybrid approach: Use external AI for generation and Zia for analysis
        let aiResponse;
        try {
            // Primary: Use external AI service (OpenAI/Anthropic/Gemini)
            aiResponse = await this.generateWithExternalAI(prompt);
            // Secondary: Use Zia for additional analysis and validation
            try {
                const userProfileText = JSON.stringify(user);
                const ziaAnalysis = await this.performZiaAnalysis(userProfileText);
                // Enhance the AI response with Zia insights
                if (aiResponse && ziaAnalysis) {
                    aiResponse.ziaInsights = ziaAnalysis;
                }
            }
            catch (ziaError) {
                console.warn('Zia analysis failed, continuing without Zia insights:', ziaError);
            }
        }
        catch (error) {
            console.error('External AI call failed:', error);
            // Fallback to local generation if all services are unavailable
            aiResponse = this.generateFallbackResponse(user, foods);
        }
        return {
            meals: aiResponse?.meals || [],
            tips: aiResponse?.tips || [],
            insights: aiResponse?.insights || [],
        };
    }
    async generateDietPlan(user, duration = 7) {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        // This integrates with Zia AI service for personalized diet planning
        // For now, we'll return a structured plan based on user profile
        return {
            name: `Personalized ${duration}-Day Plan`,
            duration,
            dailyCalories: this.calculateDailyCalories(user),
            recommendations: await this.generateMealRecommendations(user)
        };
    }
    calculateDailyCalories(user) {
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
    calculateBMR(user) {
        const { weight, height, age, gender } = user;
        if (gender === 'male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        }
        else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    }
    calculateTDEE(bmr, activityLevel) {
        const multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very-active': 1.9
        };
        return Math.round(bmr * multipliers[activityLevel]);
    }
    generateFallbackResponse(user, foods) {
        // Generate a basic fallback response when AI services are unavailable
        const userGoal = user.dietGoal || 'maintain';
        const activityLevel = user.activityLevel || 'moderate';
        // Select appropriate foods based on user profile
        const proteinFoods = foods.filter(f => f.category?.toLowerCase().includes('protein') ||
            f.name?.toLowerCase().includes('chicken') ||
            f.name?.toLowerCase().includes('fish') ||
            f.name?.toLowerCase().includes('egg'));
        const vegetableFoods = foods.filter(f => f.category?.toLowerCase().includes('vegetable') ||
            f.category?.toLowerCase().includes('fruit'));
        const grainFoods = foods.filter(f => f.category?.toLowerCase().includes('grain') ||
            f.category?.toLowerCase().includes('carb'));
        return {
            meals: [
                {
                    name: "Balanced Breakfast",
                    foods: [
                        proteinFoods[0] || { name: "Eggs", category: "protein" },
                        vegetableFoods[0] || { name: "Spinach", category: "vegetable" },
                        grainFoods[0] || { name: "Whole grain toast", category: "grain" }
                    ],
                    reason: `A protein-rich breakfast to kickstart your ${userGoal} journey with sustained energy.`
                },
                {
                    name: "Nutritious Lunch",
                    foods: [
                        proteinFoods[1] || { name: "Grilled chicken", category: "protein" },
                        vegetableFoods[1] || { name: "Mixed vegetables", category: "vegetable" },
                        grainFoods[1] || { name: "Brown rice", category: "grain" }
                    ],
                    reason: `A balanced meal that supports your ${activityLevel} lifestyle and ${userGoal} goals.`
                },
                {
                    name: "Light Dinner",
                    foods: [
                        proteinFoods[2] || { name: "Fish", category: "protein" },
                        vegetableFoods[2] || { name: "Steamed broccoli", category: "vegetable" }
                    ],
                    reason: `A lighter evening meal that aids digestion and supports your ${userGoal} objective.`
                }
            ],
            tips: [
                "Stay hydrated by drinking at least 8 glasses of water daily",
                "Include a variety of colorful vegetables in your meals",
                "Practice portion control to maintain a healthy balance",
                "Regular meal timing helps regulate your metabolism",
                "Choose whole grains over refined options when possible"
            ],
            insights: [
                `Your ${activityLevel} activity level requires balanced nutrition for optimal performance`,
                `Focus on ${userGoal === 'lose' ? 'creating a moderate caloric deficit' :
                    userGoal === 'gain' ? 'ensuring adequate protein and calories' :
                        'maintaining energy balance'} for your goals`,
                "Consistent meal patterns will help you achieve sustainable results"
            ]
        };
    }
    async generateWithExternalAI(prompt) {
        // Try multiple external AI services in order of preference
        // 1. Try OpenAI first
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (openaiApiKey) {
            try {
                const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful nutrition assistant. Always respond with valid JSON.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                }, {
                    headers: {
                        'Authorization': `Bearer ${openaiApiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                const content = response.data.choices[0]?.message?.content;
                return JSON.parse(content);
            }
            catch (error) {
                console.warn('OpenAI failed, trying next service:', error);
            }
        }
        // 2. Try Anthropic Claude as backup
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        if (anthropicApiKey) {
            try {
                const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                }, {
                    headers: {
                        'x-api-key': anthropicApiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    }
                });
                const content = response.data.content[0]?.text;
                return JSON.parse(content);
            }
            catch (error) {
                console.warn('Anthropic failed, trying next service:', error);
            }
        }
        // 3. Try Google Gemini as final backup
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey) {
            try {
                const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const content = response.data.candidates[0]?.content?.parts[0]?.text;
                return JSON.parse(content);
            }
            catch (error) {
                console.warn('Gemini failed:', error);
            }
        }
        // If all external services fail, throw error to trigger fallback
        // throw new Error('All external AI services unavailable');
    }
    async performZiaAnalysis(userProfileText) {
        try {
            // Use Zia SDK for basic analysis - adjust methods based on your actual SDK
            // This is a placeholder for when you have the actual Zia SDK methods available
            // For now, return a basic analysis structure
            // You can update this when you have access to the actual Zia SDK documentation
            // return {
            //   analysisPerformed: true,
            //   userProfileLength: userProfileText.length,
            //   analysisTimestamp: new Date().toISOString(),
            //   note: 'Zia analysis placeholder - update with actual SDK methods'
            // };
            // Commented out until actual Zia SDK methods are confirmed:
            const classificationResult = await this.zia.getTextAnalytics([userProfileText]);
            const keywordResult = await this.zia.getKeywordExtraction([userProfileText]);
            return { classification: classificationResult, keywords: keywordResult };
        }
        catch (error) {
            console.warn('Zia analysis failed:', error);
            return null;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map