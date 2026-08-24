import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { id } from 'date-fns/locale';

const WeeklySchedule = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '09:00',
    task_date: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchWeekData = async () => {
    setLoading(true);
    try {
      const startStr = format(currentWeekStart, 'yyyy-MM-dd');
      const res = await api.get(`/tasks/week?start=${startStr}`);
      setWeekData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [currentWeekStart]);

  const nextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const prevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const todayWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const handleCreateCustomTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/custom-tasks', formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        time: '09:00',
        task_date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchWeekData();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah task');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jadwal Mingguan</h2>
          <p className="text-sm text-gray-500">
            {format(days[0], 'd MMM', { locale: id })} - {format(days[6], 'd MMM yyyy', { locale: id })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm shadow-blue-100"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Task Khusus
          </button>

          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={prevWeek}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={todayWeek}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              Minggu Ini
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-x-auto pb-2">
        <div className="min-w-[1000px] h-full flex space-x-3.5">
          {days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayTasks = weekData[dateStr] || [];
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dateStr}
                className={`flex-1 flex flex-col min-w-[190px] bg-white rounded-2xl shadow-sm border transition-all ${
                  isToday
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 text-center border-b rounded-t-2xl ${
                    isToday
                      ? 'bg-blue-50/80 text-blue-900 border-blue-200'
                      : 'bg-gray-50/80 text-gray-700 border-gray-100'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {format(date, 'EEEE', { locale: id })}
                  </div>
                  <div className={`text-2xl font-extrabold my-0.5 ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {format(date, 'dd')}
                  </div>
                  <div className="text-[11px] font-medium text-gray-400">
                    {format(date, 'MMMM', { locale: id })}
                  </div>
                </div>

                {/* Task items list */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2 bg-gray-50/30">
                  {loading ? (
                    <div className="text-center text-xs text-gray-400 py-6">Memuat...</div>
                  ) : dayTasks.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 py-6">Tidak ada task</div>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={`${task.task_type}-${task.id}`}
                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-sm"
                      >
                        <div className="font-semibold text-gray-900 line-clamp-1">{task.title}</div>
                        {task.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50">
                          <span className="text-[11px] font-medium text-gray-500 flex items-center">
                            ⏰ {task.time.substring(0, 5)}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              task.task_type === 'master'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {task.task_type === 'master' ? 'Rutin' : 'Custom'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Add at bottom of column */}
                <div className="p-2 border-t border-gray-100 bg-white rounded-b-2xl">
                  <button
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        time: '09:00',
                        task_date: dateStr
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 font-medium rounded-lg flex items-center justify-center transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah di hari ini
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Tambah Task Khusus */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <h3 className="text-base font-bold text-gray-900">Tambah Task Khusus Minggu Ini</h3>
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
                  placeholder="Misal: Deadline Proposal Project"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  placeholder="Keterangan..."
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

export default WeeklySchedule;
