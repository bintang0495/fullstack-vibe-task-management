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
          ? 'bg-blue-50 text-blue-600 font-semibold' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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
        <div className="h-16 flex items-center px-5 border-b border-gray-200 gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Task Scheduler
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Weekly Routine
            </span>
          </div>
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
