import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Calendar, Settings, CalendarPlus, LogOut } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-primary-50 text-primary-600 font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
      <span>{children}</span>
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
            Task Scheduler
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <SidebarLink to="/" icon={CheckSquare}>Task Hari Ini</SidebarLink>
          <SidebarLink to="/weekly" icon={Calendar}>Jadwal Mingguan</SidebarLink>
          <SidebarLink to="/master-tasks" icon={Settings}>Setup Task Rutin</SidebarLink>
          <SidebarLink to="/custom-tasks" icon={CalendarPlus}>Task Custom</SidebarLink>
          <SidebarLink to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="text-sm text-gray-500">
            Welcome, <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
