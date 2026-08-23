import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { id } from 'date-fns/locale';

const WeeklySchedule = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(true);

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

  const nextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const prevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const todayWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Jadwal Mingguan</h2>
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button onClick={prevWeek} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={todayWeek} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition">
            Bulan Ini
          </button>
          <button onClick={nextWeek} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="min-w-[1000px] h-full flex space-x-4">
          {days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayTasks = weekData[dateStr] || [];
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

            return (
              <div key={dateStr} className={`flex-1 flex flex-col min-w-[200px] bg-white rounded-xl shadow-sm border ${isToday ? 'border-primary-400 ring-1 ring-primary-400' : 'border-gray-200'}`}>
                <div className={`p-3 text-center border-b ${isToday ? 'bg-primary-50 text-primary-900 border-primary-200' : 'bg-gray-50 border-gray-200'} rounded-t-xl`}>
                  <div className="text-sm font-semibold uppercase tracking-wider">{format(date, 'EEEE', { locale: id })}</div>
                  <div className={`text-2xl font-bold ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>{format(date, 'dd')}</div>
                  <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
                </div>
                
                <div className="flex-1 p-2 overflow-y-auto bg-gray-50/50 space-y-2">
                  {loading ? (
                    <div className="text-center text-xs text-gray-400 py-4">Loading...</div>
                  ) : dayTasks.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 py-4">Kosong</div>
                  ) : (
                    dayTasks.map((task) => (
                      <div key={`${task.task_type}-${task.id}`} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-sm">
                        <div className="font-medium text-gray-800 line-clamp-1">{task.title}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <span className="mr-1">⏰</span>{task.time.substring(0,5)}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${task.task_type === 'master' ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
