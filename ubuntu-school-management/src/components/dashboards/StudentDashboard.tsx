import React from 'react';
import { BookOpen, Calendar, Users, Trophy, Clock, Target } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const todaySchedule = [
    { time: '8:00 AM', subject: 'Mathematics', teacher: 'Mrs. Johnson', room: 'Room 12', status: 'completed' },
    { time: '9:30 AM', subject: 'English', teacher: 'Mr. Smith', room: 'Room 8', status: 'current' },
    { time: '11:00 AM', subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab 1', status: 'upcoming' },
    { time: '2:00 PM', subject: 'Social Studies', teacher: 'Mr. Wilson', room: 'Room 15', status: 'upcoming' }
  ];

  const subjects = [
    { name: 'Mathematics', grade: 'A-', progress: 85, color: 'bg-blue-500' },
    { name: 'English', grade: 'B+', progress: 78, color: 'bg-green-500' },
    { name: 'Science', grade: 'A', progress: 92, color: 'bg-purple-500' },
    { name: 'Social Studies', grade: 'B', progress: 75, color: 'bg-orange-500' }
  ];

  const achievements = [
    { title: 'Perfect Attendance', description: 'No absences this month', icon: Trophy, color: 'text-yellow-600' },
    { title: 'Top in Mathematics', description: 'Highest score in class', icon: Target, color: 'text-blue-600' },
    { title: 'Good Behavior', description: 'Exemplary conduct', icon: Users, color: 'text-green-600' }
  ];

  return (
    <div className="p-6 space-y-6 slide-in">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="african-gradient p-6">
          <h1 className="text-3xl font-bold text-white">Welcome back, Amara!</h1>
          <p className="text-orange-100 mt-2">Ready to learn and grow today?</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">95%</p>
            <p className="text-sm text-gray-600">Attendance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">B+</p>
            <p className="text-sm text-gray-600">Overall Grade</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600">Assignments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">4</p>
            <p className="text-sm text-gray-600">Classes Today</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Today's Classes
          </h2>
          
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                item.status === 'completed' ? 'bg-gray-50 border-gray-300' :
                item.status === 'current' ? 'bg-orange-50 border-orange-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{item.subject}</p>
                    <p className="text-sm text-gray-600">{item.teacher} - {item.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{item.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                      item.status === 'current' ? 'bg-orange-200 text-orange-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {item.status === 'completed' ? 'Done' :
                       item.status === 'current' ? 'Now' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Progress</h2>
          
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{subject.name}</span>
                  <span className="text-sm font-bold text-gray-900">{subject.grade}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${subject.color} transition-all duration-500`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{subject.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Achievements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Icon className={`w-8 h-8 ${achievement.color} mb-3`} />
                <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;