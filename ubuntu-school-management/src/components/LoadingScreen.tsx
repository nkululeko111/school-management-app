import React from 'react';
import { School } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen african-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 pulse-animation">
          <School className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ubuntu School System</h2>
        <p className="text-orange-100">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;