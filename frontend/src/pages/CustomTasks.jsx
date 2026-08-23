import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const CustomTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Default to today for new tasks
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [formData, setFormData] = useState({ title: '', description: '', time: '09:00', task_date: todayStr });
  const [filterDate, setFilterDate] = useState(''); // empty = all custom tasks

  const fetchTasks = async () => {
    try {
      const endpoint = filterDate ? `/custom-tasks?date=${filterDate}` : '/custom-tasks';
      const res = await api.get(endpoint);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterDate]);

  const openModal = (task = null) => {
    if (task) {
      setEditingId(task.id);
      setFormData({ title: task.title, description: task.description || '', time: task.time.substring(0, 5), task_date: task.task_date.split('T')[0] });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', time: '09:00', task_date: todayStr });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/custom-tasks/${editingId}`, formData);
      } else {
        await api.post('/custom-tasks', formData);
      }
      fetchTasks();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan task custom');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus task ini?')) {
      try {
        await api.delete(`/custom-tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Task Custom (Sekali Pakai)</h2>
        <div className="flex space-x-3 w-full md:w-auto">
          <input 
            type="date" 
            className="border border-gray-300 rounded-lg px-3 py-2 flex-1 md:flex-none text-sm focus:ring-primary-500 focus:border-primary-500"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Filter Tanggal"
          />
          <button
            onClick={() => setFilterDate('')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            style={{ display: filterDate ? 'block' : 'none' }}
          >
            Clear
          </button>
          <button
            onClick={() => openModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{task.title}</h3>
              <div className="flex space-x-1">
                <button onClick={() => openModal(task)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{task.description}</p>
            <div className="flex justify-between items-center text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded">
              <span>📅 {format(new Date(task.task_date), 'dd/MM/yyyy')}</span>
              <span>⏰ {task.time.substring(0, 5)}</span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
           <div className="col-span-full py-10 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
             Tidak ada task custom ditemukan.
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Task Custom' : 'Tambah Task Custom'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Task</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 shadow-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 shadow-sm" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input required type="date" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 shadow-sm" value={formData.task_date} onChange={e => setFormData({...formData, task_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam</label>
                  <input required type="time" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 shadow-sm" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white shadow-sm rounded-lg font-medium transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTasks;
