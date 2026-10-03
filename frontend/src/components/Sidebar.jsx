import React from 'react';
import { MessageSquare, LayoutDashboard, User, PlusCircle, Brain, Users, Shield, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ user, sidebarOpen, closeSidebar, logout }) => {
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
  );
};

export default Sidebar;
