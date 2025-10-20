import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  School,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  UserCheck
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout, isOnline } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/', roles: ['admin', 'teacher', 'parent', 'student'] },
    { icon: Users, label: 'Students', path: '/students', roles: ['admin', 'teacher'] },
    { icon: UserCheck, label: 'Attendance', path: '/attendance', roles: ['admin', 'teacher'] },
    { icon: School, label: 'Classes', path: '/classes', roles: ['admin', 'teacher'] },
    { icon: Calendar, label: 'Timetable', path: '/timetable', roles: ['admin', 'teacher', 'student'] },
    { icon: MessageSquare, label: 'Communication', path: '/communication', roles: ['admin', 'teacher', 'parent'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'teacher', 'parent'] }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 lg:left-64">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-gray-800">SA School System</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connectivity Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center gap-3 p-6 african-gradient">
          <School className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-lg font-bold text-white">SA School</h2>
            <p className="text-sm text-orange-100">Management System</p>
          </div>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 group w-full text-left ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;