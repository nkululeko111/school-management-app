import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { User, Calendar, MessageSquare, TrendingUp, Clock, Phone } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const { students } = useSchool();
  
  // Demo: assuming this parent has children in the system
  const myChildren = students.slice(0, 2);

  const recentNotifications = [
    { id: 1, message: 'Amara was present today', type: 'attendance', time: '2 hours ago', urgent: false },
    { id: 2, message: 'Parent-teacher meeting scheduled', type: 'meeting', time: '1 day ago', urgent: false },
    { id: 3, message: 'Mathematics homework submitted', type: 'homework', time: '2 days ago', urgent: false },
    { id: 4, message: 'School fees payment reminder', type: 'payment', time: '3 days ago', urgent: true }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Conference', date: 'Jan 20, 2025', child: 'Amara Okafor' },
    { id: 2, title: 'School Sports Day', date: 'Jan 25, 2025', child: 'All Children' },
    { id: 3, title: 'Mid-term Results', date: 'Jan 30, 2025', child: 'All Children' }
  ];

  return (
    <div className="p-6 space-y-6 slide-in">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="african-gradient p-6">
          <h1 className="text-3xl font-bold text-white">Welcome, Mr. Okafor</h1>
          <p className="text-orange-100 mt-2">Stay connected with your children's education</p>
        </div>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myChildren.map((child) => (
          <div key={child.id} className="bg-white rounded-xl shadow-lg p-6 card-shadow">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={child.avatar}
                alt={child.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{child.name}</h3>
                <p className="text-gray-600">{child.grade} - {child.class}</p>
                <p className="text-sm text-gray-500">Admission: {child.admissionNumber}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{child.attendance}%</p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">B+</p>
                <p className="text-sm text-gray-600">Average Grade</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                View Progress
              </button>
              <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            Recent Notifications
          </h2>
          
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                notification.urgent 
                  ? 'bg-red-50 border-red-400' 
                  : notification.type === 'attendance' 
                    ? 'bg-green-50 border-green-400'
                    : 'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-700 flex-1">{notification.message}</p>
                  <span className="text-xs text-gray-500 ml-2">{notification.time}</span>
                </div>
                {notification.urgent && (
                  <div className="mt-2">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Urgent</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Upcoming Events
          </h2>
          
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
                <h3 className="font-medium text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                <p className="text-sm text-orange-600">{event.child}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Communication Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Communication</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Call Teacher</p>
          </button>
          
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Send Message</p>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Schedule Meeting</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;