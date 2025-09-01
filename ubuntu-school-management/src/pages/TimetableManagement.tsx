import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useSchool } from '../contexts/SchoolContext';
import { 
  Calendar, 
  Clock, 
  RefreshCw, 
  Download, 
  Settings,
  BookOpen,
  Users,
  MapPin
} from 'lucide-react';

const TimetableManagement: React.FC = () => {
  const { classes } = useSchool();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const timeSlots = [
    '8:00-8:40', '8:40-9:20', '9:20-9:40', '9:40-10:20', 
    '10:20-11:00', '11:00-11:40', '11:40-12:20', '12:20-1:00', 
    '2:00-2:40', '2:40-3:20'
  ];

  const rooms = ['Room 1', 'Room 2', 'Room 3', 'Lab 1', 'Lab 2', 'Library', 'Hall', 'Playground'];

  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili', 'French', 'Physical Education', 'Art', 'Music', 'Computer Studies'];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const sampleTimetable = {
    Monday: ['Mathematics', 'English', 'Break', 'Science', 'Lunch', 'Social Studies', 'Kiswahili', 'Study Period', 'Physical Education', 'Assembly'],
    Tuesday: ['English', 'Mathematics', 'Break', 'Art', 'Lunch', 'Science', 'French', 'Study Period', 'Music', 'Library'],
    Wednesday: ['Science', 'Social Studies', 'Break', 'Mathematics', 'Lunch', 'English', 'Computer Studies', 'Study Period', 'Kiswahili', 'Study Period'],
    Thursday: ['Mathematics', 'Kiswahili', 'Break', 'English', 'Lunch', 'Physical Education', 'Science', 'Study Period', 'Social Studies', 'Study Period'],
    Friday: ['English', 'Science', 'Break', 'Mathematics', 'Lunch', 'Art', 'Music', 'Study Period', 'Assembly', 'Study Period']
  };

  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    // Simulate timetable generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Timetable generated successfully with optimized teacher allocation and resource usage!');
  };

  const conflictChecks = [
    { type: 'Teacher Conflict', status: 'clear', count: 0 },
    { type: 'Room Conflict', status: 'warning', count: 2 },
    { type: 'Resource Conflict', status: 'clear', count: 0 }
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
                <h1 className="text-2xl font-bold text-gray-800">Timetable Management</h1>
                <p className="text-gray-600 mt-1">Intelligent timetable generation and optimization</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleGenerateTimetable}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                >
                  <RefreshCw className={`${isGenerating ? 'animate-spin' : ''}`} size={16} />
                  {isGenerating ? 'Generating...' : 'Auto Generate'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Download size={16} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Generation Settings & Conflict Check */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Generation Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.grade} - {cls.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periods per Day</label>
                  <input
                    type="number"
                    defaultValue={8}
                    min={6}
                    max={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="40">40 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Conflict Check</h2>
              
              <div className="space-y-3">
                {conflictChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{check.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{check.count}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        check.status === 'clear' ? 'bg-green-400' :
                        check.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Run Full Check
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h2>
              
              <div className="space-y-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{subjects.length}</p>
                  <p className="text-sm text-gray-600">Available Subjects</p>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{rooms.length}</p>
                  <p className="text-sm text-gray-600">Available Rooms</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">95%</p>
                  <p className="text-sm text-gray-600">Efficiency Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timetable Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Weekly Timetable - {classes.find(c => c.id === selectedClass)?.name || 'Select Class'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 bg-gray-50 text-left font-medium text-gray-700 min-w-24">Time</th>
                    {days.map((day) => (
                      <th key={day} className="border border-gray-300 p-3 bg-gray-50 text-center font-medium text-gray-700 min-w-32">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={time} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-gray-700 text-sm">
                        {time}
                      </td>
                      {days.map((day) => {
                        const subject = sampleTimetable[day as keyof typeof sampleTimetable][timeIndex];
                        const isBreak = subject === 'Break' || subject === 'Lunch' || subject === 'Assembly';
                        
                        return (
                          <td key={day} className="border border-gray-300 p-2 text-center">
                            <div className={`p-2 rounded text-xs font-medium ${
                              isBreak
                                ? subject === 'Break' ? 'bg-yellow-100 text-yellow-800' :
                                  subject === 'Lunch' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors'
                            }`}>
                              {subject}
                              {!isBreak && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Room {Math.floor(Math.random() * 15) + 1}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimetableManagement;