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
export declare class AIService {
    private db;
    private zia;
    constructor();
    generateMealRecommendations(user: Record<string, any>): Promise<{
        meals: Array<{
            name: string;
            foods: Record<string, unknown>[];
            reason: string;
        }>;
        tips: string[];
        insights: string[];
    }>;
    generateDietPlan(user: Record<string, any>, duration?: number): Promise<any>;
    private calculateDailyCalories;
    private calculateBMR;
    private calculateTDEE;
    private generateFallbackResponse;
    private generateWithExternalAI;
    private performZiaAnalysis;
}
//# sourceMappingURL=aiService.d.ts.map