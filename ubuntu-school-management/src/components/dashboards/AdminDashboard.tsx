import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  TrendingUp, 
  AlertTriangle,
  MessageCircle,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  averageAttendance: number;
  recentActivities: Array<{
    id: string;
    action: string;
    student: string;
    time: string;
    type: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    averageAttendance: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        
        // Load all stats in parallel
        const [
          studentsResult,
          teachersResult,
          parentsResult,
          classesResult,
          attendanceResult
        ] = await Promise.all([
          supabase.from('students').select('id').eq('school_id', user.schoolId),
          supabase.from('teachers').select('id').eq('school_id', user.schoolId),
          supabase.from('parents').select('id'),
          supabase.from('classes').select('id').eq('school_id', user.schoolId),
          supabase.from('attendance_summary').select('attendance_percentage').eq('student_id', user.schoolId)
        ]);

        // Calculate average attendance
        const attendanceData = attendanceResult.data || [];
        const avgAttendance = attendanceData.length > 0 
          ? attendanceData.reduce((sum, record) => sum + (record.attendance_percentage || 0), 0) / attendanceData.length
          : 0;

        setStats({
          totalStudents: studentsResult.data?.length || 0,
          totalTeachers: teachersResult.data?.length || 0,
          totalParents: parentsResult.data?.length || 0,
          totalClasses: classesResult.data?.length || 0,
          averageAttendance: Math.round(avgAttendance),
          recentActivities: [
            { id: '1', action: 'New student admission', student: 'Recent Student', time: '2 hours ago', type: 'admission' },
            { id: '2', action: 'Parent meeting scheduled', student: 'Class 5A', time: '4 hours ago', type: 'meeting' },
            { id: '3', action: 'Attendance alert sent', student: '15 students', time: '6 hours ago', type: 'alert' },
            { id: '4', action: 'Report card generated', student: 'Grade 6', time: '1 day ago', type: 'report' }
          ]
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.schoolId]);

  const statsCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers.toString(),
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Total Parents',
      value: stats.totalParents.toString(),
      icon: UserCheck,
      color: 'bg-orange-500',
      change: '+3%'
    },
    {
      title: 'Average Attendance',
      value: `${stats.averageAttendance}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8%'
    }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Conference', date: 'Jan 20, 2025', time: '9:00 AM' },
    { id: 2, title: 'Mid-term Examinations', date: 'Jan 25, 2025', time: 'All Day' },
    { id: 3, title: 'School Board Meeting', date: 'Jan 30, 2025', time: '2:00 PM' }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 slide-in">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="african-gradient p-6">
          <h1 className="text-3xl font-bold text-white">Welcome back, Administrator</h1>
          <p className="text-orange-100 mt-2">Here's what's happening at Ubuntu School today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-lg p-6 card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Recent Activities
          </h2>
          
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'admission' ? 'bg-green-100' :
                  activity.type === 'meeting' ? 'bg-blue-100' :
                  activity.type === 'alert' ? 'bg-yellow-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'admission' && <Users className="w-5 h-5 text-green-600" />}
                  {activity.type === 'meeting' && <Calendar className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  {activity.type === 'report' && <BookOpen className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.student}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
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
                <p className="text-sm text-orange-600 font-medium">{event.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Add Student</p>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
            <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Send Notice</p>
          </button>
          
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">View Reports</p>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
            <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;