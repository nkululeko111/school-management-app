import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { School, Users, BookOpen, Heart, Wifi, WifiOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'parent' | 'student'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isOnline } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const roleEmails = {
        admin: 'admin@school.com',
        teacher: 'teacher@school.com',
        parent: 'parent@school.com',
        student: 'student@school.com'
      };
      
      await login(roleEmails[selectedRole], password);
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrator', icon: School, color: 'bg-orange-500' },
    { id: 'teacher', label: 'Teacher', icon: Users, color: 'bg-green-600' },
    { id: 'parent', label: 'Parent', icon: Heart, color: 'bg-blue-600' },
    { id: 'student', label: 'Student', icon: BookOpen, color: 'bg-purple-600' }
  ];

  return (
    <div className="min-h-screen african-gradient flex items-center justify-center p-4">
      {/* Connectivity Indicator */}
      <div className="connectivity-indicator">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <School className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ubuntu School System</h1>
          <p className="text-orange-100">Empowering African Education</p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Choose Your Role</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedRole === role.id
                        ? `${role.color} text-white border-transparent shadow-lg transform scale-105`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{role.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Demo Credentials */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Email: {selectedRole}@school.com</div>
                <div>Password: Any password</div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder={`${selectedRole}@school.com`}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOnline}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isLoading || !isOnline
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? 'Signing In...' : !isOnline ? 'Offline - Cannot Sign In' : 'Sign In'}
              </button>
            </form>

            {!isOnline && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You're currently offline. Some features may be limited until connection is restored.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* African Culture Footer */}
        <div className="text-center mt-8 text-orange-100">
          <p className="text-sm">Ubuntu: "I am because we are"</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;