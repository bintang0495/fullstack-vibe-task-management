const db = require('../db');

exports.getSummary = async (req, res) => {
  try {
    const { range, from, to } = req.query;
    let days = parseInt(range);
    
    let fromDate, toDate;
    const now = new Date();
    toDate = now.toISOString().split('T')[0];
    
    if (range === 'custom') {
      if (!from || !to) return res.status(400).json({ error: 'from and to required for custom range' });
      fromDate = from;
      toDate = to;
    } else if ([7, 14, 30].includes(days)) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      fromDate = d.toISOString().split('T')[0];
    } else {
       return res.status(400).json({ error: 'Invalid range' });
    }

    // Query logs within the range
    const logs = await db('task_logs')
      .where('user_id', req.user.id)
      .andWhere('task_date', '>=', fromDate)
      .andWhere('task_date', '<=', toDate);

    // We also need task titles to display in the chart. Let's fetch all masters and customs for this user
    const masterTasks = await db('master_tasks').where('user_id', req.user.id);
    const customTasks = await db('custom_tasks').where('user_id', req.user.id);

    const taskMap = {};
    masterTasks.forEach(t => taskMap[`master_${t.id}`] = t.title);
    customTasks.forEach(t => taskMap[`custom_${t.id}`] = t.title);

    const stats = {};

    logs.forEach(log => {
      const key = `${log.task_type}_${log.task_id}`;
      if (!stats[key]) {
        stats[key] = {
          title: taskMap[key] || 'Unknown Task',
          done: 0,
          not_done: 0,
          total: 0
        };
      }
      stats[key].total++;
      if (log.status === 'done') stats[key].done++;
      else stats[key].not_done++;
    });

    const summaryData = Object.values(stats).map(s => ({
      ...s,
      completion_rate: ((s.done / s.total) * 100).toFixed(2)
    }));

    res.json({
      period: { fromDate, toDate },
      data: summaryData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
