const Task = require('../models/Task');

const getStats = async (req, res) => {
  const taskQuery = { project: req.project._id };

  if (req.projectRole !== 'Admin') {
    taskQuery.assignee = req.user._id;
  }

  const now = new Date();
  const tasks = await Task.find(taskQuery).populate('assignee', 'name email');

  const byStatus = {
    'To Do': 0,
    'In Progress': 0,
    Done: 0,
  };

  tasks.forEach((task) => {
    byStatus[task.status] += 1;
  });

  const overdueTasks = tasks.filter((task) =>
    task.dueDate && task.dueDate < now && task.status !== 'Done'
  ).length;

  const perUser = {};
  tasks.forEach((task) => {
    if (!task.assignee) return;
    const key = task.assignee._id.toString();
    if (!perUser[key]) perUser[key] = { user: task.assignee, count: 0 };
    perUser[key].count += 1;
  });

  res.json({
    totalTasks: tasks.length,
    byStatus,
    overdueTasks,
    tasksPerUser: Object.values(perUser),
    projectName: req.project.name,
    memberCount: req.project.members.length,
  });
};

module.exports = { getStats };
