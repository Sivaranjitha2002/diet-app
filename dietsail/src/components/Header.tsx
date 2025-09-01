import { Apple, User, Bell } from 'lucide-react';
import {zcAuth} from '@zcatalyst/auth-client';

interface HeaderProps {
  userName: string;
  showNotifications?: boolean;
  onToggleNotifications?: () => void;
}

export async function logout() {
  await zcAuth.signOut('/');
}

export function Header({ userName, showNotifications, onToggleNotifications }: HeaderProps) {
  console.log('Header component rendered with userName:', userName);
  return (
    <header className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Apple className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">SmartDiet</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {onToggleNotifications && (
              <button
                onClick={onToggleNotifications}
                className={`p-2 rounded-full transition-colors duration-200 relative ${
                  showNotifications 
                    ? 'bg-white/30 text-white' 
                    : 'hover:bg-white/20'
                }`}
              >
                <Bell className="h-6 w-6" />
                {showNotifications && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            )}
            
            <div className="relative group">
                <button
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition-colors duration-200"
              onClick={logout}
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{userName}</span>
            </button>
            <span className="absolute left-1/2 translate-x-[-50%] mt-2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-white text-black text-xs rounded-lg px-3 py-1 shadow-lg">
              Logout
            </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}