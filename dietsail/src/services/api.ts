const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
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

  // Auth methods
  async register(userData: any) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
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
  async createMeal(mealData: any) {
    return this.request('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  async getUserMeals(date?: string) {
    const endpoint = date ? `/meals?date=${date}` : '/meals';
    return this.request(endpoint);
  }

  async markMealConsumed(mealId: string) {
    return this.request(`/meals/${mealId}/consume`, {
      method: 'PATCH',
    });
  }

  // AI methods
  async getAIRecommendations() {
    return this.request('/ai/recommendations');
  }

  async generateDietPlan(duration: number = 7) {
    return this.request('/ai/diet-plan', {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
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