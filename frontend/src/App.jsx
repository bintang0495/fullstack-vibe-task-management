import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import TodayTasks from './pages/TodayTasks';
import MasterTasks from './pages/MasterTasks';
import CustomTasks from './pages/CustomTasks';
import WeeklySchedule from './pages/WeeklySchedule';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<TodayTasks />} />
            <Route path="master-tasks" element={<MasterTasks />} />
            <Route path="custom-tasks" element={<CustomTasks />} />
            <Route path="weekly" element={<WeeklySchedule />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
