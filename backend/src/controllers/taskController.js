const db = require('../db');

// --- Master Tasks ---

exports.getMasterTasks = async (req, res) => {
  try {
    const tasks = await db('master_tasks')
      .where({ user_id: req.user.id, is_active: true })
      .orderBy('time', 'asc');
      
    const taskIds = tasks.map(t => t.id);
    const days = await db('master_task_days').whereIn('master_task_id', taskIds);
    
    const tasksWithDays = tasks.map(t => ({
      ...t,
      days: days.filter(d => d.master_task_id === t.id).map(d => d.day_of_week)
    }));
    
    res.json(tasksWithDays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createMasterTask = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { title, description, time, days } = req.body;
    
    if (!title || !time || !days || !days.length) {
      return res.status(400).json({ error: 'Title, time, and days are required' });
    }

    const [task] = await trx('master_tasks').insert({
      user_id: req.user.id,
      title,
      description,
      time
    }).returning('*');

    const dayInserts = days.map(day_of_week => ({
      master_task_id: task.id,
      day_of_week
    }));
    
    await trx('master_task_days').insert(dayInserts);
    
    await trx.commit();
    res.status(201).json({ ...task, days });
  } catch (error) {
    await trx.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMasterTask = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { id } = req.params;
    const { title, description, time, days } = req.body;

    const task = await trx('master_tasks').where({ id, user_id: req.user.id }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await trx('master_tasks').where({ id }).update({ title, description, time });

    await trx('master_task_days').where({ master_task_id: id }).del();
    
    if (days && days.length > 0) {
      const dayInserts = days.map(day_of_week => ({
        master_task_id: id,
        day_of_week
      }));
      await trx('master_task_days').insert(dayInserts);
    }
    
    await trx.commit();
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    await trx.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMasterTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('master_tasks')
      .where({ id, user_id: req.user.id })
      .update({ is_active: false });
      
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Custom Tasks ---

exports.getCustomTasks = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const query = db('custom_tasks').where({ user_id: req.user.id });
    if (date) {
      query.where('task_date', date);
    }
    const tasks = await query.orderBy('time', 'asc');
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createCustomTask = async (req, res) => {
  try {
    const { title, description, time, task_date } = req.body;
    if (!title || !time || !task_date) {
      return res.status(400).json({ error: 'Title, time, and task_date are required' });
    }

    const [task] = await db('custom_tasks').insert({
      user_id: req.user.id,
      title,
      description,
      time,
      task_date
    }).returning('*');
    
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCustomTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time, task_date } = req.body;
    
    const updated = await db('custom_tasks')
      .where({ id, user_id: req.user.id })
      .update({ title, description, time, task_date });
      
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCustomTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('custom_tasks')
      .where({ id, user_id: req.user.id })
      .del();
      
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Task Today & Week Logic ---

const getTasksForDate = async (user_id, dateStr) => {
  // dateStr in YYYY-MM-DD
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();

  // 1. Get Master Tasks for this day
  const masterTasks = await db('master_tasks')
    .join('master_task_days', 'master_tasks.id', 'master_task_days.master_task_id')
    .where('master_tasks.user_id', user_id)
    .andWhere('master_tasks.is_active', true)
    .andWhere('master_task_days.day_of_week', dayOfWeek)
    .select('master_tasks.*');

  // 2. Get Custom Tasks for this date
  const customTasks = await db('custom_tasks')
    .where({ user_id, task_date: dateStr });

  // 3. Lazy Create Logs
  const tasksToLog = [];
  masterTasks.forEach(t => tasksToLog.push({ type: 'master', id: t.id }));
  customTasks.forEach(t => tasksToLog.push({ type: 'custom', id: t.id }));

  if (tasksToLog.length > 0) {
    const existingLogs = await db('task_logs')
      .where({ user_id, task_date: dateStr });
    
    const logsToInsert = [];
    for (const t of tasksToLog) {
      const exists = existingLogs.find(l => l.task_type === t.type && l.task_id === t.id);
      if (!exists) {
        logsToInsert.push({
          user_id,
          task_type: t.type,
          task_id: t.id,
          task_date: dateStr,
          status: 'not_done'
        });
      }
    }
    
    if (logsToInsert.length > 0) {
      // Use raw knex insert with onConflict ignore just in case of race condition
      await db('task_logs').insert(logsToInsert).onConflict(['user_id', 'task_type', 'task_id', 'task_date']).ignore();
    }
  }

  // 4. Fetch all logs for this date
  const finalLogs = await db('task_logs').where({ user_id, task_date: dateStr });

  // 5. Combine data
  const combined = [];
  
  masterTasks.forEach(t => {
    const log = finalLogs.find(l => l.task_type === 'master' && l.task_id === t.id);
    if(log) {
      combined.push({ ...t, task_type: 'master', log_id: log.id, status: log.status, completed_at: log.completed_at });
    }
  });
  
  customTasks.forEach(t => {
    const log = finalLogs.find(l => l.task_type === 'custom' && l.task_id === t.id);
    if (log) {
      combined.push({ ...t, task_type: 'custom', log_id: log.id, status: log.status, completed_at: log.completed_at });
    }
  });

  return combined.sort((a, b) => a.time.localeCompare(b.time));
};

exports.getTasksToday = async (req, res) => {
  try {
    // Current date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const tasks = await getTasksForDate(req.user.id, today);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTasksWeek = async (req, res) => {
  try {
    const { start } = req.query; // start date of the week (Monday or Sunday)
    if (!start) return res.status(400).json({ error: 'start query param is required' });

    const result = {};
    const startDate = new Date(start);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      result[dateStr] = await getTasksForDate(req.user.id, dateStr);
    }
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTaskLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['done', 'not_done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const completed_at = status === 'done' ? db.fn.now() : null;
    
    const updated = await db('task_logs')
      .where({ id, user_id: req.user.id })
      .update({ status, completed_at });
      
    if (!updated) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
