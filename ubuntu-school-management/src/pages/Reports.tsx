import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [academicData, setAcademicData] = useState<any[]>([]);

  const reportTypes = [
    { id: 'attendance', label: 'Attendance Report', icon: Users },
    { id: 'academic', label: 'Academic Performance', icon: GraduationCap },
    { id: 'financial', label: 'Financial Summary', icon: BarChart3 },
    { id: 'communication', label: 'Communication Analytics', icon: TrendingUp }
  ];

  useEffect(() => {
    const loadReportData = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        
        if (selectedReport === 'attendance') {
          // Load attendance data by grade
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance_summary')
            .select(`
              attendance_percentage,
              students(class_id, classes(grade))
            `)
            .eq('school_id', user.schoolId);

          if (attendanceError) throw attendanceError;

          // Group by grade
          const groupedData = attendanceData?.reduce((acc: any, record: any) => {
            const grade = record.students?.classes?.grade || 'Unknown';
            if (!acc[grade]) {
              acc[grade] = { present: 0, absent: 0, total: 0, percentage: 0 };
            }
            acc[grade].percentage = record.attendance_percentage;
            acc[grade].total += 1;
            acc[grade].present += Math.round(record.attendance_percentage / 100);
            acc[grade].absent += Math.round((100 - record.attendance_percentage) / 100);
            return acc;
          }, {});

          const formattedData = Object.entries(groupedData || {}).map(([grade, data]: [string, any]) => ({
            grade,
            present: data.present,
            absent: data.absent,
            total: data.total,
            percentage: data.percentage
          }));

          setAttendanceData(formattedData);
        } else if (selectedReport === 'academic') {
          // Load academic performance data
          const { data: gradesData, error: gradesError } = await supabase
            .from('grades')
            .select(`
              score,
              max_score,
              subjects(name)
            `)
            .eq('school_id', user.schoolId);

          if (gradesError) throw gradesError;

          // Group by subject
          const groupedGrades = gradesData?.reduce((acc: any, grade: any) => {
            const subject = grade.subjects?.name || 'Unknown';
            if (!acc[subject]) {
              acc[subject] = { scores: [], total: 0, count: 0 };
            }
            const percentage = (grade.score / grade.max_score) * 100;
            acc[subject].scores.push(percentage);
            acc[subject].total += percentage;
            acc[subject].count += 1;
            return acc;
          }, {});

          const formattedAcademic = Object.entries(groupedGrades || {}).map(([subject, data]: [string, any]) => ({
            subject,
            average: Math.round(data.total / data.count),
            trend: 'stable', // TODO: Calculate actual trend
            improvement: '+0.0%' // TODO: Calculate actual improvement
          }));

          setAcademicData(formattedAcademic);
        }
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedReport, user?.schoolId]);

  const academicPerformance = academicData;

  const insights = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Excellent Attendance',
      description: 'Grade 5 has achieved 94.8% attendance this month, exceeding the target of 90%.'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Science Performance',
      description: 'Science scores have dropped by 2.1% across all grades. Consider additional support programs.'
    },
    {
      type: 'info',
      icon: TrendingUp,
      title: 'Communication Reach',
      description: 'SMS notifications have a 98.5% delivery rate, making them the most effective channel.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights into school performance and operations</p>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Report Type Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedReport === report.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{report.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className={`rounded-xl shadow-lg p-6 ${
                  insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <Icon className={`w-6 h-6 mb-3 ${
                    insight.type === 'success' ? 'text-green-600' :
                    insight.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <h3 className="font-bold text-gray-800 mb-2">{insight.title}</h3>
                  <p className="text-sm text-gray-700">{insight.description}</p>
                </div>
              );
            })}
          </div>

          {/* Report Content */}
          {selectedReport === 'attendance' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Analysis</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Grade</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Present</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Absent</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Percentage</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-800">{row.grade}</td>
                        <td className="py-4 px-4 text-center text-green-600 font-medium">{row.present}</td>
                        <td className="py-4 px-4 text-center text-red-600 font-medium">{row.absent}</td>
                        <td className="py-4 px-4 text-center text-gray-800">{row.total}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-medium ${
                            row.percentage >= 95 ? 'text-green-600' :
                            row.percentage >= 90 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            row.percentage >= 95 ? 'bg-green-100 text-green-800' :
                            row.percentage >= 90 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row.percentage >= 95 ? 'Excellent' :
                             row.percentage >= 90 ? 'Good' : 'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport === 'academic' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Academic Performance Analysis</h2>
              
              <div className="space-y-4">
                {academicPerformance.map((subject, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">{subject.subject}</h3>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${
                          subject.trend === 'up' ? 'text-green-500' :
                          subject.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          subject.trend === 'up' ? 'text-green-600' :
                          subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {subject.improvement}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              subject.average >= 80 ? 'bg-green-500' :
                              subject.average >= 70 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subject.average}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-bold text-gray-800 min-w-12">{subject.average}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;