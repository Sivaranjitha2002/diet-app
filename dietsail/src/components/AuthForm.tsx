import React, { useState } from 'react';
import { Apple, User, Phone, Calendar, Ruler, Weight } from 'lucide-react';
import { Datastore } from '@zcatalyst/datastore';

export function AuthForm({ userName, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    phone: '',
    age: '',
    gender: 'female',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: 'moderate',
    dietGoal: 'maintain',
    dietPreferences: [],
    allergies: [],
    healthConditions: []
  });
  const datastore = new Datastore();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      errors.age = 'Please enter a valid age';
    }
    
    if (!formData.height || parseInt(formData.height) < 50 || parseInt(formData.height) > 300) {
      errors.height = 'Please enter a valid height (50-300 cm)';
    }
    
    if (!formData.weight || parseInt(formData.weight) < 20 || parseInt(formData.weight) > 500) {
      errors.weight = 'Please enter a valid weight (20-500 kg)';
    }
    
    if (!formData.targetWeight || parseInt(formData.targetWeight) < 20 || parseInt(formData.targetWeight) > 500) {
      errors.targetWeight = 'Please enter a valid target weight (20-500 kg)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);

    try {
        // Add minimum loading time to show the processing state
        const [result] = await Promise.all([
          datastore.table('30268000000046736').insertRow({
            id: userId,
            ...formData
          }),
          // Minimum 1 second delay to show loading state
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
        
        // Success - you might want to redirect or show success message
        console.log('Registration successful:', result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed!';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Apple className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NutriAI</h1>
          <p className="text-green-100 mt-2">Your AI-Powered Nutrition Companion</p>
        </div>

        {/* Form */}
        <div className="p-6">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="name"
                value={userName}
                onChange={handleInputChange}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>            
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    validationErrors.age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.age && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.age}</p>
                )}
              </div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    validationErrors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.height && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.height}</p>
                )}
              </div>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    validationErrors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.weight && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.weight}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                name="targetWeight"
                placeholder="Target Weight (kg)"
                value={formData.targetWeight}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  validationErrors.targetWeight ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.targetWeight && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.targetWeight}</p>
              )}
            </div>

            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Light (light exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
              <option value="active">Active (hard exercise 6-7 days/week)</option>
              <option value="very-active">Very Active (very hard exercise, physical job)</option>
            </select>

            <select
              name="dietGoal"
              value={formData.dietGoal}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Weight</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Register'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}