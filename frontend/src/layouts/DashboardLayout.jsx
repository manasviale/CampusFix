import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, MessageSquare, User, PlusCircle, Brain, Users, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const getNavLinks = () => {
    const links = [
      { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { to: '/complaints', icon: <MessageSquare size={20} />, label: 'Complaints' },
    ];

    if (['volunteer', 'admin'].includes(user?.role)) {
      links.push({ to: '/complaints/new', icon: <PlusCircle size={20} />, label: 'Create Complaint' });
    }
    
    if (['faculty', 'admin'].includes(user?.role)) {
      links.push({ to: '/insights', icon: <Brain size={20} />, label: 'AI Insights' });
      links.push({ to: '/volunteers', icon: <Users size={20} />, label: 'Volunteers' });
    }

    if (user?.role === 'admin') {
      links.push({ to: '/admin', icon: <Shield size={20} />, label: 'Admin Panel' });
    }

    links.push({ to: '/profile', icon: <User size={20} />, label: 'Profile' });
    return links;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-primary-hover border-b border-white/10">
          <span className="text-xl font-bold tracking-wider text-secondary">CampusFix</span>
          <button onClick={closeSidebar} className="lg:hidden text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {getNavLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-hover text-white'
                      : 'text-gray-300 hover:bg-primary-hover hover:text-white'
                  }`
                }
              >
                {link.icon}
                <span className="ml-3">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-gray-300 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">Welcome, {user?.name}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
