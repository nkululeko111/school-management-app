const express = require('express');
const router = express.Router();

// Demo attendance data
let attendanceRecords = [
  {
    id: '1',
    studentId: '1',
    date: '2025-01-15',
    status: 'present',
    timeIn: '08:00',
    timeOut: '15:30',
    markedBy: 'teacher-1',
    notes: ''
  },
  {
    id: '2',
    studentId: '2',
    date: '2025-01-15',
    status: 'absent',
    markedBy: 'teacher-1',
    notes: 'Sick leave',
    notificationSent: true,
    notificationTime: '2025-01-15T09:00:00Z'
  }
];

// Mark attendance for a class
router.post('/mark', async (req, res) => {
  try {
    const { classId, date, attendanceData, markedBy } = req.body;
    
    const records = [];
    
    for (const [studentId, status] of Object.entries(attendanceData)) {
      const record = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        studentId,
        classId,
        date,
        status: status ? 'present' : 'absent',
        timeIn: status ? '08:00' : null,
        markedBy,
        timestamp: new Date().toISOString(),
        notificationSent: false
      };
      
      records.push(record);
      attendanceRecords.push(record);
    }
    
    // Simulate sending notifications for absent students
    const absentRecords = records.filter(r => r.status === 'absent');
    if (absentRecords.length > 0) {
      // In production, integrate with SMS/WhatsApp APIs
      setTimeout(() => {
        absentRecords.forEach(record => {
          const recordIndex = attendanceRecords.findIndex(r => r.id === record.id);
          if (recordIndex !== -1) {
            attendanceRecords[recordIndex].notificationSent = true;
            attendanceRecords[recordIndex].notificationTime = new Date().toISOString();
          }
        });
      }, 1000);
    }
    
    res.json({
      records,
      notificationsSent: absentRecords.length,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get attendance for date range
router.get('/', (req, res) => {
  try {
    const { startDate, endDate, classId, studentId } = req.query;
    
    let filtered = [...attendanceRecords];
    
    if (startDate) {
      filtered = filtered.filter(r => r.date >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(r => r.date <= endDate);
    }
    
    if (classId) {
      filtered = filtered.filter(r => r.classId === classId);
    }
    
    if (studentId) {
      filtered = filtered.filter(r => r.studentId === studentId);
    }
    
    res.json({
      records: filtered,
      total: filtered.length,
      message: 'Attendance records retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve attendance records' });
  }
});

// Get attendance statistics
router.get('/stats/:classId', (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    
    let classRecords = attendanceRecords.filter(r => r.classId === classId);
    
    if (startDate) {
      classRecords = classRecords.filter(r => r.date >= startDate);
    }
    
    if (endDate) {
      classRecords = classRecords.filter(r => r.date <= endDate);
    }
    
    const totalRecords = classRecords.length;
    const presentRecords = classRecords.filter(r => r.status === 'present').length;
    const absentRecords = totalRecords - presentRecords;
    
    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
    
    res.json({
      stats: {
        totalRecords,
        presentRecords,
        absentRecords,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      },
      message: 'Attendance statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve attendance statistics' });
  }
});

// Send late arrival notification
router.post('/notify-late', async (req, res) => {
  try {
    const { studentId, parentContact, studentName } = req.body;
    
    // In production, integrate with SMS/WhatsApp APIs
    const message = `Hello, your child ${studentName} arrived late to school today. Please ensure punctuality. - Ubuntu School`;
    
    // Simulate sending notification
    setTimeout(() => {
      console.log(`SMS sent to ${parentContact}: ${message}`);
    }, 100);
    
    res.json({
      sent: true,
      channel: 'SMS',
      recipient: parentContact,
      message: 'Late arrival notification sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;