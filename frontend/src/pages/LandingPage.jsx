import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Activity, Shield, BarChart3, Camera, Users, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Campus<span className="text-secondary">Fix</span></span>
            </div>
            <div>
              <Link to="/login" className="text-gray-600 hover:text-primary px-4 py-2 font-medium">Log in</Link>
              <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors">Sign up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-primary text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Report. Track. <span className="text-secondary">Resolve.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 mb-10">
            The AI-powered campus complaint management system. Smarter categorizing, faster resolutions, and complete transparency for your college.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-md font-bold text-lg transition-colors shadow-lg">
              Get Started
            </Link>
            <a href="#how-it-works" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-md font-bold text-lg transition-colors">
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-500">A streamlined process from problem to solution.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative">
                <Camera size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Submit</h3>
              <p className="text-gray-500">Volunteers capture issues with photos and details.</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-500">AI instantly categorizes and sets priority.</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track</h3>
              <p className="text-gray-500">Follow real-time status updates and mark issues you're affected by.</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Resolution</h3>
              <p className="text-gray-500">Faculty resolves issues and improves the campus.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features</h2>
            <p className="mt-4 text-lg text-gray-500">Everything you need to maintain a perfect campus.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Brain size={24} />, title: 'AI-Powered Classification', desc: 'Auto-assign departments, priority, and summaries using Gemini AI.' },
              { icon: <Activity size={24} />, title: 'Real-time Tracking', desc: 'Know exactly where a complaint stands from submitted to resolved.' },
              { icon: <Shield size={24} />, title: 'Role-based Access', desc: 'Custom views and permissions for students, volunteers, faculty, and admins.' },
              { icon: <BarChart3 size={24} />, title: 'Campus Insights', desc: 'Analytics dashboards and AI-generated briefings for administration.' },
              { icon: <Camera size={24} />, title: 'Image Uploads', desc: 'Visual proof makes it easier for maintenance teams to locate issues.' },
              { icon: <Users size={24} />, title: "I'm Affected Reporting", desc: 'Mark yourself as affected to naturally highlight widespread campus issues.' },
            ].map((feat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feat.title}</h3>
                <p className="text-gray-600">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Designed for Everyone</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center">
              <h3 className="text-lg font-bold text-primary mb-2">Student</h3>
              <p className="text-sm text-gray-600">Can view complaints, track progress, and mark issues they are affected by.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center border-t-4 border-t-secondary">
              <h3 className="text-lg font-bold text-primary mb-2">Volunteer</h3>
              <p className="text-sm text-gray-600">Trusted students who can create new complaints with photo evidence.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center">
              <h3 className="text-lg font-bold text-primary mb-2">Faculty</h3>
              <p className="text-sm text-gray-600">Review AI insights and manage volunteer permissions.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center">
              <h3 className="text-lg font-bold text-primary mb-2">Admin</h3>
              <p className="text-sm text-gray-600">Full control to edit, resolve, or delete complaints.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to improve your campus?</h2>
          <Link to="/register" className="inline-flex items-center bg-white text-secondary hover:bg-gray-100 px-8 py-3 rounded-md font-bold text-lg transition-colors">
            Join CampusFix <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-white">Campus<span className="text-secondary">Fix</span></span>
            <p className="text-sm mt-2">© 2026 CampusFix. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
