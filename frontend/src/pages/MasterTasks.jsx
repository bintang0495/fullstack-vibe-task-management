import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MasterTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', time: '09:00', days: [] });

  const fetchTasks = async () => {
    try {
      const res = await api.get('/master-tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Setup Task Rutin</h2>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{task.title}</h3>
              <div className="flex space-x-1">
                <button onClick={() => openModal(task)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{task.description}</p>
            <div className="text-sm font-medium text-gray-700 mb-2">Jam: {task.time.substring(0, 5)}</div>
            <div className="flex flex-wrap gap-1">
              {DAYS.map((day, idx) => {
                const isActive = task.days.includes(idx);
                return isActive ? (
                  <span key={idx} className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-700 font-medium">
                    {day.substring(0, 3)}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Task Rutin' : 'Tambah Task Rutin'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Task</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pelaksanaan</label>
                <input required type="time" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hari Berulang</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDayToggle(idx)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.days.includes(idx) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" disabled={formData.days.length === 0} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterTasks;
