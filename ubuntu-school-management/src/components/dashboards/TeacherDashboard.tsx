import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { Users, UserCheck, BookOpen, MessageSquare, Calendar, Clock } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { students, classes } = useSchool();
  
  const myClasses = classes.filter(c => c.teacher === 'Mrs. Sarah Johnson'); // Demo filter
  const myStudents = students.filter(s => myClasses.some(c => c.name === s.class));

  const todaySchedule = [
    { time: '8:00 AM', subject: 'Mathematics', class: '5A', room: 'Room 12' },
    { time: '9:30 AM', subject: 'English', class: '5A', room: 'Room 12' },
    { time: '11:00 AM', subject: 'Science', class: '5B', room: 'Lab 1' },
    { time: '2:00 PM', subject: 'Social Studies', class: '5A', room: 'Room 12' }
  ];

  const recentActivity = [
    { action: 'Marked attendance for 5A', time: '30 mins ago' },
    { action: 'Graded mathematics test', time: '2 hours ago' },
    { action: 'Sent homework reminder', time: '4 hours ago' },
    { action: 'Updated lesson plan', time: '1 day ago' }
  ];

  return (
    <div className="p-6 space-y-6 slide-in">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="african-gradient p-6">
          <h1 className="text-3xl font-bold text-white">Good morning, Mrs. Johnson</h1>
          <p className="text-orange-100 mt-2">Ready to inspire young minds today?</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myStudents.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myClasses.length}</p>
            </div>
            <BookOpen className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{todaySchedule.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Today's Schedule
          </h2>
          
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-orange-600 min-w-20">{item.time}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.subject}</p>
                  <p className="text-sm text-gray-600">{item.class} - {item.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-3 border-l-4 border-orange-200 bg-orange-50 rounded-r-lg">
                <p className="text-sm text-gray-700">{activity.action}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
            <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Mark Attendance</p>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Grade Assignments</p>
          </button>
          
          <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group">
            <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Send Message</p>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Update Timetable</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;