import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, X, CalendarCheck } from 'lucide-react';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MasterTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', time: '09:00', days: [] });
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/master-tasks');
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

  const openModal = (task = null) => {
    if (task) {
      setEditingId(task.id);
      setFormData({ title: task.title, description: task.description || '', time: task.time.substring(0, 5), days: task.days });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', time: '09:00', days: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDayToggle = (dayIdx) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayIdx)
        ? prev.days.filter(d => d !== dayIdx)
        : [...prev.days, dayIdx]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/master-tasks/${editingId}`, formData);
      } else {
        await api.post('/master-tasks', formData);
      }
      fetchTasks();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan task');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus task rutin ini?')) {
      try {
        await api.delete(`/master-tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Setup Task Rutin</h2>
          <p className="text-sm text-gray-500">Jadwal kegiatan berulang tiap minggunya</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold transition-all shadow-sm shadow-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Task Rutin
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Memuat task rutin...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada task rutin</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Tambahkan task rutin yang berulang di hari-hari tertentu setiap pekan (seperti standup meeting, olahraga, review mingguan).
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm shadow-blue-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Task Rutin Sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base text-gray-900 line-clamp-1">{task.title}</h3>
                  <div className="flex space-x-1">
                    <button onClick={() => openModal(task)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100 mt-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
                  ⏰ Jam {task.time.substring(0, 5)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {DAYS.map((day, idx) => {
                    const isActive = task.days.includes(idx);
                    return isActive ? (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {day}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <h3 className="text-base font-bold text-gray-900">{editingId ? 'Edit Task Rutin' : 'Tambah Task Rutin Baru'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Task</label>
                <input required type="text" placeholder="Misal: Daily Standup" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea placeholder="Deskripsi task..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pelaksanaan</label>
                <input required type="time" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hari Berulang (Pilih hari)</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDayToggle(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        formData.days.includes(idx) ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {formData.days.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Pilih minimal 1 hari</p>
                )}
              </div>
              <div className="pt-3 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Batal</button>
                <button type="submit" disabled={formData.days.length === 0} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 shadow-sm shadow-blue-100">Simpan Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterTasks;
