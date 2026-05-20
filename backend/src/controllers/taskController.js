const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const populateTask = (query) =>
  query.populate('assignee', 'name email').populate('createdBy', 'name email');

const isProjectMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

const getProjectTasks = async (req, res) => {
  const query = { project: req.project._id };

  if (req.projectRole !== 'Admin') {
    query.assignee = req.user._id;
  }

  const tasks = await populateTask(Task.find(query))
    .sort({ createdAt: -1 });

  res.json(tasks);
};

const createTask = async (req, res) => {
  if (!req.project.isAdmin(req.user._id)) {
    return res.status(403).json({ message: 'Admin only can create tasks' });
  }

  const { title, description, project: projectId, assignee, priority, status, dueDate } = req.body;

  if (assignee && !isProjectMember(req.project, assignee)) {
    return res.status(400).json({ message: 'Assignee must be a project member' });
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignee: assignee || undefined,
    priority,
    status,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    createdBy: req.user._id,
  });

  await Activity.create({
    project: task.project,
    user: req.user._id,
    action: 'created task',
    taskTitle: task.title,
  });

  await task.populate('assignee', 'name email');
  await task.populate('createdBy', 'name email');
  res.status(201).json(task);
};

const getTask = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const project = await Project.findById(task.project._id || task.project);
  const isAdmin = project.isAdmin(req.user._id);
  const isAssignee = task.assignee?._id?.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(task);
};

const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  const isAdmin = project.isAdmin(req.user._id);
  const isAssignee = task.assignee?.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const previousStatus = task.status;

  if (!isAdmin) {
    if (req.body.status) task.status = req.body.status;
  } else {
    const { title, description, assignee, priority, status, dueDate } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) {
      if (assignee && !isProjectMember(project, assignee)) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
      task.assignee = assignee || null;
    }
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
  }

  await task.save();

  if (previousStatus !== task.status) {
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: `moved to ${task.status}`,
      taskTitle: task.title,
    });
  }

  await task.populate('assignee', 'name email');
  await task.populate('createdBy', 'name email');
  res.json(task);
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project.isAdmin(req.user._id)) {
    return res.status(403).json({ message: 'Admin only' });
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
};

module.exports = {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
