import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, CalendarPlus, Settings, X } from 'lucide-react';

const TodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [formData, setFormData] = useState({ title: '', description: '', time: '09:00', task_date: todayStr });

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

  const handleCreateCustomTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/custom-tasks', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', time: '09:00', task_date: todayStr });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah task');
    }
  };

  const formattedDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Memuat task hari ini...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Hari Ini</h2>
          <p className="text-sm text-gray-500 font-medium">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/master-tasks"
            className="inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2 text-gray-500" />
            Kelola Task Rutin
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm shadow-blue-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Task Hari Ini
          </button>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada task untuk hari ini</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Anda belum memiliki jadwal task rutin atau custom task untuk hari ini. Silakan tambahkan task baru untuk memulai!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm shadow-blue-100"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              + Tambah Task Khusus Hari Ini
            </button>
            <Link
              to="/master-tasks"
              className="inline-flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition"
            >
              <Settings className="w-4 h-4 mr-2" />
              + Buat Jadwal Rutin Mingguan
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <li
                key={task.log_id}
                className="p-5 hover:bg-gray-50/80 flex items-start justify-between transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      checked={task.status === 'done'}
                      onChange={() => toggleTask(task.log_id, task.status)}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-base font-semibold transition-all ${
                        task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`mt-1 text-sm ${
                          task.status === 'done' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-2.5 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                          task.task_type === 'master'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {task.task_type === 'master' ? 'Task Rutin' : 'Task Custom'}
                      </span>
                      <span className="text-gray-500 font-medium">⏰ Pukul {task.time.substring(0, 5)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal Quick Add Custom Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <h3 className="text-base font-bold text-gray-900">Tambah Task Hari Ini</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Task</label>
                <input
                  required
                  type="text"
                  placeholder="Misal: Meeting dengan Klien"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  placeholder="Keterangan tambahan..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.task_date}
                    onChange={(e) => setFormData({ ...formData, task_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam</label>
                  <input
                    required
                    type="time"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm shadow-blue-100"
                >
                  Simpan Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayTasks;
