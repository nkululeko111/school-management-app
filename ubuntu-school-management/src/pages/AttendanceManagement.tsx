import React, { useState } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import Navigation from '../components/Navigation';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

const AttendanceManagement: React.FC = () => {
  const { students, classes, markAttendance } = useSchool();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const classStudents = students.filter(student => 
    classes.find(c => c.id === selectedClass)?.name === student.class
  );

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: present
    }));
  };

  const handleSubmitAttendance = () => {
    Object.entries(attendanceData).forEach(([studentId, present]) => {
      markAttendance(studentId, present);
    });
    
    // Send notifications for absent students
    const absentStudents = classStudents.filter(student => 
      attendanceData[student.id] === false
    );
    
    if (absentStudents.length > 0) {
      // Simulate sending notifications
      alert(`Attendance notifications sent to ${absentStudents.length} parent(s) via SMS and WhatsApp`);
    }
    
    alert('Attendance marked successfully!');
  };

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = Object.values(attendanceData).filter(present => present === false).length;
  const unmarkedCount = classStudents.length - presentCount - absentCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
                <p className="text-gray-600 mt-1">Track and manage student attendance with real-time notifications</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Class and Date Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.grade} - {cls.name} ({cls.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSubmitAttendance}
                  disabled={unmarkedCount === classStudents.length}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                  Submit Attendance
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{classStudents.length}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{unmarkedCount}</p>
              <p className="text-sm text-gray-600">Unmarked</p>
            </div>
          </div>

          {/* Attendance List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Mark Attendance</h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                {classStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-600">
                          {student.admissionNumber} • {student.parentContact}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAttendanceChange(student.id, true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          attendanceData[student.id] === true
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <CheckCircle size={16} />
                        Present
                      </button>
                      
                      <button
                        onClick={() => handleAttendanceChange(student.id, false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          attendanceData[student.id] === false
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        <XCircle size={16} />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Preview */}
          {absentCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-medium text-yellow-800">Absence Notifications</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {absentCount} parent(s) will be notified via SMS and WhatsApp about their child's absence when you submit attendance.
                  </p>
                  <div className="mt-3 p-3 bg-white border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "Hello, your child Amara was absent from school today. Please contact the school if this was unexpected. - Ubuntu School"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceManagement;