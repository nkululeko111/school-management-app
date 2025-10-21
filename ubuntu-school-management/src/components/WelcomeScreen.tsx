import React from 'react';
import { School, Users, BookOpen, Heart, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen african-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <School className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Ubuntu School System</h1>
          <p className="text-xl text-orange-100 mb-8">Empowering African Education Through Technology</p>
          <p className="text-lg text-orange-200 max-w-2xl mx-auto">
            A comprehensive school management system designed for African schools, 
            featuring student management, attendance tracking, communication tools, 
            and academic reporting.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Student Management</h3>
            <p className="text-orange-100 text-sm">Complete student profiles, enrollment, and academic tracking</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Academic Tools</h3>
            <p className="text-orange-100 text-sm">Grade management, report cards, and performance analytics</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Heart className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Parent Engagement</h3>
            <p className="text-orange-100 text-sm">SMS, WhatsApp, and email communication with parents</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <School className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">School Administration</h3>
            <p className="text-orange-100 text-sm">Attendance, timetables, and comprehensive reporting</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-orange-100 mb-6">
              Set up your school's digital infrastructure in minutes. 
              Our onboarding process will guide you through creating your school profile 
              and setting up your administrator account.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <div className="bg-orange-600/20 text-white px-4 py-2 rounded-lg font-medium text-sm">
                ✓ Free Setup
              </div>
              <div className="bg-orange-600/20 text-white px-4 py-2 rounded-lg font-medium text-sm">
                ✓ No Technical Knowledge Required
              </div>
              <div className="bg-orange-600/20 text-white px-4 py-2 rounded-lg font-medium text-sm">
                ✓ 24/7 Support
              </div>
            </div>
          </div>
        </div>

        {/* African Culture Footer */}
        <div className="text-center mt-12 text-orange-100">
          <p className="text-lg font-medium">Ubuntu: "I am because we are"</p>
          <p className="text-sm mt-2">Building stronger communities through education</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
