const express = require('express');
const router = express.Router();

// Get attendance reports
router.get('/attendance', (req, res) => {
  try {
    const { startDate, endDate, grade, format } = req.query;
    
    // Demo attendance data by grade
    const attendanceData = [
      { grade: 'Grade 1', present: 145, absent: 12, total: 157, percentage: 92.4 },
      { grade: 'Grade 2', present: 138, absent: 8, total: 146, percentage: 94.5 },
      { grade: 'Grade 3', present: 142, absent: 15, total: 157, percentage: 90.4 },
      { grade: 'Grade 4', present: 134, absent: 11, total: 145, percentage: 92.4 },
      { grade: 'Grade 5', present: 128, absent: 7, total: 135, percentage: 94.8 },
      { grade: 'Grade 6', present: 125, absent: 13, total: 138, percentage: 90.6 }
    ];
    
    let filtered = attendanceData;
    if (grade) {
      filtered = attendanceData.filter(item => item.grade === grade);
    }
    
    const summary = {
      totalStudents: filtered.reduce((sum, item) => sum + item.total, 0),
      totalPresent: filtered.reduce((sum, item) => sum + item.present, 0),
      totalAbsent: filtered.reduce((sum, item) => sum + item.absent, 0),
      overallAttendance: 0
    };
    
    summary.overallAttendance = summary.totalStudents > 0 
      ? Math.round((summary.totalPresent / summary.totalStudents) * 100 * 100) / 100 
      : 0;
    
    res.json({
      data: filtered,
      summary,
      period: { startDate, endDate },
      message: 'Attendance report generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

// Get academic performance reports
router.get('/academic', (req, res) => {
  try {
    const { grade, subject, term } = req.query;
    
    const academicData = [
      {
        subject: 'Mathematics',
        grades: {
          'Grade 1': { average: 82.5, highest: 98, lowest: 45, classAverage: 82.5 },
          'Grade 2': { average: 78.3, highest: 95, lowest: 52, classAverage: 78.3 },
          'Grade 3': { average: 75.7, highest: 92, lowest: 48, classAverage: 75.7 },
          'Grade 4': { average: 79.2, highest: 96, lowest: 55, classAverage: 79.2 },
          'Grade 5': { average: 77.8, highest: 94, lowest: 51, classAverage: 77.8 },
          'Grade 6': { average: 81.1, highest: 97, lowest: 58, classAverage: 81.1 }
        },
        trend: 'improving',
        improvement: '+3.2%'
      },
      {
        subject: 'English',
        grades: {
          'Grade 1': { average: 85.2, highest: 99, lowest: 62, classAverage: 85.2 },
          'Grade 2': { average: 83.1, highest: 96, lowest: 58, classAverage: 83.1 },
          'Grade 3': { average: 79.8, highest: 93, lowest: 54, classAverage: 79.8 },
          'Grade 4': { average: 82.4, highest: 95, lowest: 61, classAverage: 82.4 },
          'Grade 5': { average: 84.6, highest: 98, lowest: 65, classAverage: 84.6 },
          'Grade 6': { average: 86.3, highest: 99, lowest: 68, classAverage: 86.3 }
        },
        trend: 'stable',
        improvement: '+1.1%'
      }
    ];
    
    let filtered = academicData;
    if (subject) {
      filtered = academicData.filter(item => item.subject.toLowerCase() === subject.toLowerCase());
    }
    
    res.json({
      data: filtered,
      term: term || 'Term 1',
      generatedAt: new Date().toISOString(),
      message: 'Academic performance report generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate academic report' });
  }
});

// Get financial reports
router.get('/financial', (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const financialData = {
      revenue: {
        schoolFees: 2500000, // KES
        extraCurricular: 150000,
        transport: 300000,
        meals: 200000,
        total: 3150000
      },
      expenses: {
        salaries: 1800000,
        utilities: 120000,
        supplies: 200000,
        maintenance: 80000,
        other: 150000,
        total: 2350000
      },
      profit: 800000,
      collections: {
        collected: 2950000,
        pending: 200000,
        collectionRate: 93.7
      },
      trends: {
        revenue: '+8.5%',
        expenses: '+2.1%',
        profit: '+15.3%'
      }
    };
    
    res.json({
      data: financialData,
      period,
      currency: 'KES',
      generatedAt: new Date().toISOString(),
      message: 'Financial report generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

// Get communication analytics
router.get('/communication', (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const communicationData = {
      channels: [
        { name: 'SMS', sent: 1247, delivered: 1228, deliveryRate: 98.5, cost: 'KES 12,470' },
        { name: 'WhatsApp', sent: 856, delivered: 842, deliveryRate: 98.4, cost: 'KES 0' },
        { name: 'Email', sent: 234, delivered: 230, deliveryRate: 98.3, cost: 'KES 0' },
        { name: 'In-App', sent: 445, delivered: 445, deliveryRate: 100, cost: 'KES 0' }
      ],
      engagement: {
        readRate: 87.3,
        responseRate: 23.6,
        avgResponseTime: '2.4 hours'
      },
      topMessages: [
        { type: 'Attendance Alert', count: 324, engagement: 91.2 },
        { type: 'Fee Reminder', count: 156, engagement: 78.5 },
        { type: 'School Announcement', count: 89, engagement: 94.7 },
        { type: 'Parent Meeting', count: 67, engagement: 96.3 }
      ],
      costAnalysis: {
        totalCost: 12470,
        costPerMessage: 4.2,
        mostEfficient: 'WhatsApp',
        recommendations: [
          'Increase WhatsApp usage to reduce SMS costs',
          'Optimize message timing for better engagement',
          'Use templates for common notifications'
        ]
      }
    };
    
    res.json({
      data: communicationData,
      period,
      generatedAt: new Date().toISOString(),
      message: 'Communication analytics generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate communication analytics' });
  }
});

// Export report
router.post('/export', (req, res) => {
  try {
    const { reportType, format, filters } = req.body;
    
    // Simulate report generation
    const exportData = {
      id: Date.now().toString(),
      type: reportType,
      format,
      filters,
      filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`,
      size: '2.3 MB',
      downloadUrl: `/api/reports/download/${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'ready'
    };
    
    res.json({
      export: exportData,
      message: 'Report export prepared successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export report' });
  }
});

module.exports = router;