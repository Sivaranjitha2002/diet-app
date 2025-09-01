const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
  }

  // Utility to build query params from an object
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // User methods
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(updates: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getNutritionGoals() {
    return this.request('/users/nutrition-goals');
  }

  // Food methods
  async getAllFoods() {
    return this.request('/foods');
  }

  async searchFoods(query: string) {
    return this.request(`/foods/search?q=${encodeURIComponent(query)}`);
  }

  async getFoodById(id: string) {
    return this.request(`/foods/${id}`);
  }

  // Meal methods
  async createMeal(mealData: any, userId: string) {
    return this.request(`/meals?userId=${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  async updateMeal(mealData: any, userId: string) {
    return this.request(`/meals?userId=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  }

  async getUserMeals(userId: string, date?: string) {
    let endpoint = '/meals';
    console.log('Fetching meals for user:', userId, 'on date:', date);
    const queryParams = this.buildQueryParams({ userId, date });
    console.log('Query Params:', queryParams);
    if (queryParams) endpoint += queryParams;
    return this.request(endpoint);
  }

  async markMealConsumed(mealId: string) {
    return this.request(`/meals/${mealId}/consume`, {
      method: 'PATCH',
    });
  }

  // Notification methods
  async getNotifications(userId: string) {
    console.log('Fetching notifications for user:', userId);
    return this.request(`/notifications?userId=${encodeURIComponent(userId)}`);
  }

  async updateNotification(id: string, updates: any) {
    return this.request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async toggleNotification(id: string) {
    return this.request(`/notifications/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();