import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const TodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/today');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (logId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'not_done' : 'done';
    
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.log_id === logId ? { ...t, status: newStatus } : t
    ));

    try {
      await api.patch(`/task-logs/${logId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchTasks();
    }
  };

  const todayStr = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Task Hari Ini: {todayStr}</h2>
      
      {tasks.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
          Tidak ada task untuk hari ini. Waktunya bersantai!
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.log_id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      checked={task.status === 'done'}
                      onChange={() => toggleTask(task.log_id, task.status)}
                    />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`mt-1 text-sm ${task.status === 'done' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center space-x-2 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${
                        task.task_type === 'master' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {task.task_type === 'master' ? 'Rutin' : 'Custom'}
                      </span>
                      <span className="text-gray-400">Pukul {task.time.substring(0,5)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TodayTasks;
