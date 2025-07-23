import React from 'react';
import { Apple, User, Bell } from 'lucide-react';

interface HeaderProps {
  userName: string;
  onProfileClick: () => void;
  onNotificationsClick: () => void;
}

export function Header({ userName, onProfileClick, onNotificationsClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Apple className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">NutriAI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onNotificationsClick}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-200"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={onProfileClick}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition-colors duration-200"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{userName}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}