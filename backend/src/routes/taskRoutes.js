const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all task routes

router.get('/master-tasks', taskController.getMasterTasks);
router.post('/master-tasks', taskController.createMasterTask);
router.put('/master-tasks/:id', taskController.updateMasterTask);
router.delete('/master-tasks/:id', taskController.deleteMasterTask);

router.get('/custom-tasks', taskController.getCustomTasks);
router.post('/custom-tasks', taskController.createCustomTask);
router.put('/custom-tasks/:id', taskController.updateCustomTask);
router.delete('/custom-tasks/:id', taskController.deleteCustomTask);

router.get('/tasks/today', taskController.getTasksToday);
router.get('/tasks/week', taskController.getTasksWeek);
router.patch('/task-logs/:id', taskController.updateTaskLog);

module.exports = router;
