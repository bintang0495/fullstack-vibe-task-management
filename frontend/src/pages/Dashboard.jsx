import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [range, setRange] = useState('7');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [summaryData, setSummaryData] = useState([]);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      let url = `/dashboard/summary?range=${range}`;
      if (range === 'custom') {
        if (!customFrom || !customTo) {
          setLoading(false);
          return;
        }
        url += `&from=${customFrom}&to=${customTo}`;
      }
      const res = await api.get(url);
      setSummaryData(res.data.data);
      setPeriod(res.data.period);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (range !== 'custom' || (range === 'custom' && customFrom && customTo)) {
      fetchSummary();
    }
  }, [range, customFrom, customTo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Evaluasi</h2>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="14">14 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {range === 'custom' && (
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="text-sm border-none bg-transparent focus:ring-0 p-0" />
              <span className="text-gray-400">-</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="text-sm border-none bg-transparent focus:ring-0 p-0" />
            </div>
          )}
        </div>
      </div>

      {period && (
        <div className="text-sm text-gray-500">
          Menampilkan data dari <span className="font-medium text-gray-700">{period.fromDate}</span> sampai <span className="font-medium text-gray-700">{period.toDate}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Pencapaian Task (Done vs Not Done)</h3>
        
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-400">Loading chart...</div>
        ) : summaryData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400 flex-col space-y-2">
            <span className="text-4xl">📊</span>
            <span>Tidak ada data log task pada periode ini.</span>
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="title" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  height={80} 
                  tick={{fill: '#6B7280', fontSize: 12}}
                />
                <YAxis tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                <Bar dataKey="done" name="Selesai (Done)" stackId="a" fill="#34D399" radius={[0, 0, 4, 4]} />
                <Bar dataKey="not_done" name="Terlewat (Not Done)" stackId="a" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && summaryData.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex-1 overflow-hidden pr-4">
              <h4 className="font-semibold text-gray-800 truncate">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.done} selesai dari total {item.total}</p>
            </div>
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                />
                <path
                  className={`${parseFloat(item.completion_rate) > 75 ? 'text-green-500' : parseFloat(item.completion_rate) > 40 ? 'text-yellow-500' : 'text-red-500'}`}
                  strokeDasharray={`${item.completion_rate}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{Math.round(item.completion_rate)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
