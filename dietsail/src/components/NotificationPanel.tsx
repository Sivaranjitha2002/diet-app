import React, { useState } from 'react';
import { Notification } from '../types';
import { Bell, Clock, Utensils, Dumbbell, Scale, Heart, X } from 'lucide-react';
import { PushNotification } from '@zcatalyst/push-notification';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onToggleNotification: (id: string) => void;
  onUpdateNotification: (id: string, updates: Partial<Notification>) => void;
}

export function NotificationPanel({ 
  isOpen, 
  onClose, 
  notifications, 
  onToggleNotification,
  onUpdateNotification 
}: NotificationPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  if (!isOpen) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'meal':
        return <Utensils className="h-5 w-5 text-green-600" />;
      case 'exercise':
        return <Dumbbell className="h-5 w-5 text-blue-600" />;
      case 'weight-check':
        return <Scale className="h-5 w-5 text-purple-600" />;
      case 'health-check':
        return <Heart className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  function testFunc() {
    console.log('Test function in NotificationPanel');
  }

  const registerClient = async () => {
    setIsRegistering(true);
    try {
      const pushNotification = new PushNotification();

      // Enable notifications
      await pushNotification.enableNotification();

      // Set up message handler before enabling notifications
      pushNotification.messageHandler = (message) => {
        console.log('Received notification:', message);
        testFunc();
      };
      setIsRegistered(true);
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Bell className="mr-3 text-green-600" />
            Notifications
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-full pb-20">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-50 rounded-lg p-4 border ${
                  notification.enabled ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div>
                      <h3 className="font-medium text-gray-800">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notification.enabled}
                        onChange={() => onToggleNotification(notification.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {editingId === notification.id ? (
                      <input
                        type="time"
                        value={notification.scheduledTime}
                        onChange={(e) => onUpdateNotification(notification.id, { scheduledTime: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditingId(notification.id)}
                        className="cursor-pointer hover:text-gray-700"
                      >
                        {notification.scheduledTime}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notification.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {notification.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Notification Settings</h4>
            <p className="text-sm text-blue-700 mb-3">
              Notifications will be sent to your registered email and phone number.
              Make sure to keep your contact information up to date in your profile.
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Push Notifications</span>
              <button
                onClick={registerClient}
                disabled={isRegistering || isRegistered}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isRegistered 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : isRegistering
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isRegistering ? 'Registering...' : isRegistered ? 'Registered' : 'Enable Push'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}