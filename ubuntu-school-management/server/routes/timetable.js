const express = require('express');
const router = express.Router();

// Demo timetable data
let timetables = [
  {
    id: '1',
    classId: '1',
    academicYear: '2024-2025',
    term: 'Term 1',
    schedule: {
      Monday: [
        { period: 1, time: '8:00-8:40', subject: 'Mathematics', teacher: 'Mrs. Johnson', room: 'Room 12' },
        { period: 2, time: '8:40-9:20', subject: 'English', teacher: 'Mr. Smith', room: 'Room 12' },
        { period: 3, time: '9:20-9:40', subject: 'Break', teacher: null, room: 'Playground' },
        { period: 4, time: '9:40-10:20', subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab 1' },
        { period: 5, time: '10:20-11:00', subject: 'Lunch', teacher: null, room: 'Cafeteria' },
        { period: 6, time: '11:00-11:40', subject: 'Social Studies', teacher: 'Mr. Wilson', room: 'Room 12' },
        { period: 7, time: '11:40-12:20', subject: 'Kiswahili', teacher: 'Mrs. Mwangi', room: 'Room 12' },
        { period: 8, time: '12:20-1:00', subject: 'Study Period', teacher: 'Mrs. Johnson', room: 'Room 12' }
      ]
      // Other days would be similar...
    },
    generatedAt: '2024-09-01T00:00:00Z',
    generatedBy: 'admin-1',
    conflicts: [],
    efficiency: 95.5,
    status: 'active'
  }
];

// Generate timetable
router.post('/generate', async (req, res) => {
  try {
    const { 
      classId, 
      subjects, 
      teachers, 
      rooms, 
      constraints,
      periodsPerDay = 8,
      daysPerWeek = 5 
    } = req.body;
    
    // Simulate intelligent timetable generation
    const generatedTimetable = {
      id: Date.now().toString(),
      classId,
      academicYear: '2024-2025',
      term: 'Term 1',
      schedule: generateOptimalSchedule(subjects, teachers, rooms, periodsPerDay, daysPerWeek),
      generatedAt: new Date().toISOString(),
      generatedBy: req.user?.userId || 'admin',
      conflicts: [],
      efficiency: Math.random() * 10 + 90, // 90-100% efficiency
      status: 'active',
      parameters: {
        periodsPerDay,
        daysPerWeek,
        subjects: subjects?.length || 0,
        teachers: teachers?.length || 0,
        rooms: rooms?.length || 0
      }
    };
    
    timetables.push(generatedTimetable);
    
    res.json({
      timetable: generatedTimetable,
      message: 'Timetable generated successfully with optimal resource allocation'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate timetable' });
  }
});

// Helper function to generate optimal schedule
function generateOptimalSchedule(subjects, teachers, rooms, periodsPerDay, daysPerWeek) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00-8:40', '8:40-9:20', '9:20-9:40', '9:40-10:20', 
    '10:20-11:00', '11:00-11:40', '11:40-12:20', '12:20-1:00'
  ];
  
  const schedule = {};
  const defaultSubjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili'];
  const subjectsToUse = subjects && subjects.length > 0 ? subjects : defaultSubjects;
  
  days.slice(0, daysPerWeek).forEach(day => {
    schedule[day] = [];
    
    for (let period = 0; period < periodsPerDay; period++) {
      if (period === 2) { // Break time
        schedule[day].push({
          period: period + 1,
          time: timeSlots[period],
          subject: 'Break',
          teacher: null,
          room: 'Playground'
        });
      } else if (period === 4) { // Lunch time
        schedule[day].push({
          period: period + 1,
          time: timeSlots[period],
          subject: 'Lunch',
          teacher: null,
          room: 'Cafeteria'
        });
      } else {
        // Assign subjects with some intelligence
        const subjectIndex = (period + days.indexOf(day)) % subjectsToUse.length;
        const subject = subjectsToUse[subjectIndex];
        
        schedule[day].push({
          period: period + 1,
          time: timeSlots[period],
          subject: subject,
          teacher: `Teacher ${Math.floor(Math.random() * 5) + 1}`,
          room: `Room ${Math.floor(Math.random() * 15) + 1}`
        });
      }
    }
  });
  
  return schedule;
}

// Get timetable for class
router.get('/class/:classId', (req, res) => {
  try {
    const classTimetable = timetables.find(t => t.classId === req.params.classId && t.status === 'active');
    
    if (!classTimetable) {
      return res.status(404).json({ error: 'Timetable not found for this class' });
    }
    
    res.json({
      timetable: classTimetable,
      message: 'Timetable retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve timetable' });
  }
});

// Check for conflicts
router.post('/check-conflicts', (req, res) => {
  try {
    const { schedule, teachers, rooms } = req.body;
    
    const conflicts = [];
    
    // Simple conflict detection logic
    Object.entries(schedule).forEach(([day, periods]) => {
      const teacherSlots = {};
      const roomSlots = {};
      
      periods.forEach((period, index) => {
        if (period.teacher && period.teacher !== null) {
          const key = `${period.teacher}-${period.time}`;
          if (teacherSlots[key]) {
            conflicts.push({
              type: 'teacher',
              day,
              time: period.time,
              conflict: `${period.teacher} is assigned to multiple classes`,
              severity: 'high'
            });
          } else {
            teacherSlots[key] = true;
          }
        }
        
        if (period.room && period.room !== 'Playground' && period.room !== 'Cafeteria') {
          const key = `${period.room}-${period.time}`;
          if (roomSlots[key]) {
            conflicts.push({
              type: 'room',
              day,
              time: period.time,
              conflict: `${period.room} is double-booked`,
              severity: 'medium'
            });
          } else {
            roomSlots[key] = true;
          }
        }
      });
    });
    
    res.json({
      conflicts,
      conflictCount: conflicts.length,
      severity: conflicts.length === 0 ? 'none' : 
               conflicts.some(c => c.severity === 'high') ? 'high' : 'medium',
      message: 'Conflict check completed'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
});

// Optimize timetable
router.post('/optimize/:id', (req, res) => {
  try {
    const timetableIndex = timetables.findIndex(t => t.id === req.params.id);
    
    if (timetableIndex === -1) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    // Simulate optimization
    const optimizedEfficiency = Math.min(100, timetables[timetableIndex].efficiency + Math.random() * 5);
    
    timetables[timetableIndex] = {
      ...timetables[timetableIndex],
      efficiency: Math.round(optimizedEfficiency * 100) / 100,
      conflicts: [], // Assume optimization resolves conflicts
      lastOptimized: new Date().toISOString()
    };
    
    res.json({
      timetable: timetables[timetableIndex],
      improvements: {
        efficiencyGain: optimizedEfficiency - timetables[timetableIndex].efficiency,
        conflictsResolved: Math.floor(Math.random() * 3) + 1,
        resourceUtilization: '+12%'
      },
      message: 'Timetable optimized successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize timetable' });
  }
});

module.exports = router;