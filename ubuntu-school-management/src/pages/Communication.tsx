import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Phone, 
  Mail,
  Smartphone,
  BellRing,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Class {
  id: string;
  name: string;
  grade: string;
}

const Communication: React.FC = () => {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'email' | 'app'>('sms');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'class' | 'individual'>('all');
  const [message, setMessage] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const channels = [
    { id: 'sms', label: 'SMS', icon: Phone, color: 'bg-green-500', description: 'Instant delivery, works on all phones' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-600', description: 'Rich messaging with media support' },
    { id: 'email', label: 'Email', icon: Mail, color: 'bg-blue-500', description: 'Detailed communication with attachments' },
    { id: 'app', label: 'In-App', icon: BellRing, color: 'bg-purple-500', description: 'Push notifications to mobile app' }
  ];

  const recentMessages = [
    { 
      id: 1, 
      type: 'SMS', 
      audience: 'Grade 5 Parents', 
      message: 'Parent-teacher meeting scheduled for Friday at 2 PM', 
      sent: '2 hours ago',
      delivered: 28,
      total: 30
    },
    { 
      id: 2, 
      type: 'WhatsApp', 
      audience: 'All Parents', 
      message: 'School fees payment deadline reminder', 
      sent: '1 day ago',
      delivered: 156,
      total: 160
    },
    { 
      id: 3, 
      type: 'Email', 
      audience: 'Teachers', 
      message: 'Monthly staff meeting agenda and materials', 
      sent: '2 days ago',
      delivered: 15,
      total: 15
    }
  ];

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, grade')
          .eq('school_id', user.schoolId)
          .order('grade');

        if (classesError) throw classesError;

        setClasses(classesData || []);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [user?.schoolId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setSending(true);
      
      // Save message to database
      const { error } = await supabase
        .from('communications')
        .insert({
          channel: selectedChannel,
          audience: selectedAudience,
          message: message,
          class_id: selectedAudience === 'class' ? selectedClass : null,
          school_id: user?.schoolId,
          sent_by: user?.id,
          status: 'sent'
        });

      if (error) throw error;

      // TODO: Implement actual notification sending (SMS, WhatsApp, Email)
      alert(`Message sent via ${selectedChannel.toUpperCase()} to ${selectedAudience} successfully!`);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const messageTemplates = [
    'School will be closed tomorrow due to weather conditions.',
    'Parent-teacher meetings are scheduled for next week.',
    'School fees payment deadline is approaching.',
    'Your child was absent today. Please contact the school.',
    'Exam schedule has been updated. Please check the portal.'
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
                <h1 className="text-2xl font-bold text-gray-800">Communication Center</h1>
                <p className="text-gray-600 mt-1">Send notifications via SMS, WhatsApp, Email, and In-App messaging</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message Composition */}
            <div className="lg:col-span-2 space-y-6">
              {/* Channel Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Choose Communication Channel</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id as any)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          selectedChannel === channel.id
                            ? `${channel.color} text-white border-transparent shadow-lg transform scale-105`
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <Icon className="w-6 h-6 mb-2" />
                        <h3 className="font-medium">{channel.label}</h3>
                        <p className={`text-sm mt-1 ${
                          selectedChannel === channel.id ? 'text-white opacity-90' : 'text-gray-600'
                        }`}>
                          {channel.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Composition */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Compose Message</h2>
                
                <div className="space-y-4">
                  {/* Audience Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setSelectedAudience('all')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedAudience === 'all'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Users className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">All Parents</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedAudience('class')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedAudience === 'class'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Users className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Specific Class</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedAudience('individual')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedAudience === 'individual'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Users className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Individual</span>
                      </button>
                    </div>
                  </div>

                  {selectedAudience === 'class' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                      {loading ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading classes...
                        </div>
                      ) : (
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Choose a class...</option>
                          {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                              {cls.grade} - {cls.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Message Templates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                    <div className="grid gap-2">
                      {messageTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(template)}
                          className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {message.length}/160 characters {selectedChannel === 'sms' && message.length > 160 && '(Multiple SMS)'}
                    </p>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {sending ? 'Sending...' : `Send via ${selectedChannel.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Recent Messages
                </h2>
                
                <div className="space-y-4">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            msg.type === 'SMS' ? 'bg-green-100 text-green-800' :
                            msg.type === 'WhatsApp' ? 'bg-green-100 text-green-800' :
                            msg.type === 'Email' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {msg.type}
                          </span>
                          <span className="text-sm text-gray-600">{msg.audience}</span>
                        </div>
                        <span className="text-xs text-gray-500">{msg.sent}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{msg.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{msg.delivered}/{msg.total} delivered</span>
                        </div>
                        <div className={`w-full bg-gray-200 rounded-full h-2 max-w-24`}>
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${(msg.delivered / msg.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">This Month</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SMS Sent</span>
                    <span className="font-medium text-gray-800">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">WhatsApp Messages</span>
                    <span className="font-medium text-gray-800">856</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email Notifications</span>
                    <span className="font-medium text-gray-800">234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Delivery Rate</span>
                    <span className="font-medium text-green-600">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Communication;