import { User } from '../types';
import { ICatalystRow } from '@zcatalyst/datastore/dist-types/utils/interface';
export declare class AIService {
    private db;
    constructor();
    generateMealRecommendations(user: User): Promise<{
        meals: Array<{
            name: string;
            foods: ICatalystRow[];
            reason: string;
        }>;
        tips: string[];
        insights: string[];
    }>;
    generateDietPlan(user: User, duration?: number): Promise<any>;
    private calculateDailyCalories;
    private calculateBMR;
    private calculateTDEE;
}
//# sourceMappingURL=aiService.d.ts.map