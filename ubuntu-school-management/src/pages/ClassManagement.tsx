import React, { useState } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import Navigation from '../components/Navigation';
import { 
  School, 
  Users, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2,
  UserPlus,
  Calendar,
  Clock
} from 'lucide-react';

const ClassManagement: React.FC = () => {
  const { classes, students, getClassStudents } = useSchool();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');

  const selectedClassData = classes.find(c => c.id === selectedClass);
  const classStudents = selectedClassData ? getClassStudents(selectedClass) : [];

  const scheduleData = [
    { day: 'Monday', periods: ['Mathematics', 'English', 'Break', 'Science', 'Lunch', 'Social Studies', 'Kiswahili'] },
    { day: 'Tuesday', periods: ['English', 'Mathematics', 'Break', 'Physical Education', 'Lunch', 'Art', 'Music'] },
    { day: 'Wednesday', periods: ['Science', 'Mathematics', 'Break', 'English', 'Lunch', 'Computer Studies', 'Library'] },
    { day: 'Thursday', periods: ['Social Studies', 'Kiswahili', 'Break', 'Mathematics', 'Lunch', 'Science', 'English'] },
    { day: 'Friday', periods: ['Mathematics', 'Science', 'Break', 'English', 'Lunch', 'Social Studies', 'Assembly'] }
  ];

  const timeSlots = ['8:00-8:40', '8:40-9:20', '9:20-9:40', '9:40-10:20', '10:20-11:00', '11:00-11:40', '11:40-12:20'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                <p className="text-gray-600 mt-1">Organize classes, assign teachers, and manage timetables</p>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Plus size={16} />
                Add New Class
              </button>
            </div>
          </div>

          {/* Class Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.grade} - {cls.name} (Teacher: {cls.teacher})
                </option>
              ))}
            </select>
          </div>

          {selectedClassData && (
            <>
              {/* Class Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center card-shadow">
                  <School className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{selectedClassData.name}</p>
                  <p className="text-sm text-gray-600">{selectedClassData.grade}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center card-shadow">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{classStudents.length}</p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center card-shadow">
                  <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{selectedClassData.subjects.length}</p>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center card-shadow">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900">35</p>
                  <p className="text-sm text-gray-600">Periods/Week</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Details */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Class Information</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-2">Class Teacher</h3>
                      <p className="text-gray-900">{selectedClassData.teacher}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-2">Subjects Taught</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedClassData.subjects.map((subject, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Edit size={16} />
                        Edit Class
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <UserPlus size={16} />
                        Add Student
                      </button>
                    </div>
                  </div>
                </div>

                {/* Students in Class */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Students ({classStudents.length})</h2>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {classStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            student.attendance >= 90 ? 'bg-green-400' :
                            student.attendance >= 75 ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <span className="text-sm text-gray-600">{student.attendance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Timetable */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Weekly Timetable - {selectedClassData.name}
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-3 bg-gray-50 text-left font-medium text-gray-700">Time</th>
                        {scheduleData.map((day) => (
                          <th key={day.day} className="border border-gray-300 p-3 bg-gray-50 text-center font-medium text-gray-700">
                            {day.day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time, timeIndex) => (
                        <tr key={time}>
                          <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-gray-700 text-sm">
                            {time}
                          </td>
                          {scheduleData.map((day) => (
                            <td key={day.day} className="border border-gray-300 p-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                day.periods[timeIndex] === 'Break' ? 'bg-yellow-100 text-yellow-800' :
                                day.periods[timeIndex] === 'Lunch' ? 'bg-green-100 text-green-800' :
                                day.periods[timeIndex] === 'Assembly' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {day.periods[timeIndex]}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClassManagement;