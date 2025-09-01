const express = require('express');
const router = express.Router();

// Demo message data
let messages = [
  {
    id: '1',
    sender: 'admin-1',
    recipients: ['all-parents'],
    channel: 'sms',
    subject: 'School Closure Notice',
    message: 'School will be closed tomorrow due to heavy rains. Stay safe!',
    sentAt: '2025-01-14T10:00:00Z',
    status: 'delivered',
    deliveryStats: {
      sent: 160,
      delivered: 158,
      failed: 2
    }
  }
];

// Send message
router.post('/send', async (req, res) => {
  try {
    const { recipients, channel, subject, message, scheduledAt } = req.body;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: req.user?.userId || 'demo-user',
      recipients,
      channel,
      subject,
      message,
      sentAt: scheduledAt || new Date().toISOString(),
      status: 'sending',
      deliveryStats: {
        sent: 0,
        delivered: 0,
        failed: 0
      }
    };
    
    messages.push(newMessage);
    
    // Simulate message sending process
    setTimeout(() => {
      const messageIndex = messages.findIndex(m => m.id === newMessage.id);
      if (messageIndex !== -1) {
        const estimatedRecipients = recipients.includes('all') ? 160 : 
                                   recipients.includes('class') ? 30 : 1;
        
        messages[messageIndex].status = 'delivered';
        messages[messageIndex].deliveryStats = {
          sent: estimatedRecipients,
          delivered: Math.floor(estimatedRecipients * 0.98), // 98% delivery rate
          failed: Math.ceil(estimatedRecipients * 0.02)
        };
      }
    }, 2000);
    
    res.json({
      message: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get message history
router.get('/history', (req, res) => {
  try {
    const { page = 1, limit = 10, channel, status } = req.query;
    
    let filtered = [...messages];
    
    if (channel) {
      filtered = filtered.filter(m => m.channel === channel);
    }
    
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    
    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = filtered.slice(startIndex, endIndex);
    
    res.json({
      messages: paginatedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length,
        pages: Math.ceil(filtered.length / parseInt(limit))
      },
      message: 'Message history retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve message history' });
  }
});

// Get communication statistics
router.get('/stats', (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const periodMessages = messages.filter(m => 
      new Date(m.sentAt) >= startDate
    );
    
    const stats = {
      totalMessages: periodMessages.length,
      smsCount: periodMessages.filter(m => m.channel === 'sms').length,
      whatsappCount: periodMessages.filter(m => m.channel === 'whatsapp').length,
      emailCount: periodMessages.filter(m => m.channel === 'email').length,
      appNotificationCount: periodMessages.filter(m => m.channel === 'app').length,
      totalDelivered: periodMessages.reduce((sum, m) => sum + (m.deliveryStats?.delivered || 0), 0),
      totalSent: periodMessages.reduce((sum, m) => sum + (m.deliveryStats?.sent || 0), 0),
      deliveryRate: 0
    };
    
    stats.deliveryRate = stats.totalSent > 0 
      ? Math.round((stats.totalDelivered / stats.totalSent) * 100 * 100) / 100 
      : 0;
    
    res.json({
      stats,
      period,
      message: 'Communication statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve communication statistics' });
  }
});

// Send emergency notification
router.post('/emergency', async (req, res) => {
  try {
    const { message, includeParents, includeTeachers, includeStudents } = req.body;
    
    const recipients = [];
    if (includeParents) recipients.push('all-parents');
    if (includeTeachers) recipients.push('all-teachers');
    if (includeStudents) recipients.push('all-students');
    
    const emergencyMessage = {
      id: Date.now().toString(),
      sender: req.user?.userId || 'admin',
      recipients,
      channel: 'multi', // Send via all available channels
      subject: '🚨 EMERGENCY NOTIFICATION',
      message,
      sentAt: new Date().toISOString(),
      status: 'sending',
      priority: 'high',
      deliveryStats: {
        sent: 0,
        delivered: 0,
        failed: 0
      }
    };
    
    messages.push(emergencyMessage);
    
    res.json({
      message: emergencyMessage,
      message: 'Emergency notification sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send emergency notification' });
  }
});

module.exports = router;