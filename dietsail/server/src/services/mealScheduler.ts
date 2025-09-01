import { Database } from '../config/database';

export class MealScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private database: Database;

  constructor() {
    this.database = Database.getInstance();
  }

  public start(): void {
    if (this.intervalId) {
      console.log('Meal scheduler is already running');
      return;
    }

    // Check for meal notifications every minute
    this.intervalId = setInterval(async () => {
      try {
        await this.database.checkAndSendMealNotifications();
      } catch (error) {
        console.error('Error in meal scheduler:', error);
      }
    }, 60000); // 1 minute interval

    console.log('🍽️ Meal notification scheduler started');
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Meal notification scheduler stopped');
    }
  }

  public async scheduleImmediateMealNotification(userId: string, mealName: string): Promise<void> {
    await this.database.sendMealReminderNotification(userId, mealName, 'now');
  }
}
