const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const ensureAdmin = (project, userId, res) => {
  if (!project.isAdmin(userId)) {
    res.status(403).json({ message: 'Admin only' });
    return false;
  }
  return true;
};

const listProjects = async (req, res) => {
  const projects = await Project.find({ 'members.user': req.user._id })
    .populate('members.user', 'name email')
    .sort({ updatedAt: -1 });

  res.json(projects);
};

const createProject = async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'Admin' }],
  });

  await project.populate('members.user', 'name email');
  res.status(201).json(project);
};

const getProject = async (req, res) => {
  await req.project.populate('members.user', 'name email');
  res.json(req.project);
};

const updateProject = async (req, res) => {
  if (!ensureAdmin(req.project, req.user._id, res)) return;

  const { name, description } = req.body;
  if (name) req.project.name = name;
  if (description !== undefined) req.project.description = description;

  await req.project.save();
  await req.project.populate('members.user', 'name email');
  res.json(req.project);
};

const deleteProject = async (req, res) => {
  if (!ensureAdmin(req.project, req.user._id, res)) return;

  await Promise.all([
    Task.deleteMany({ project: req.project._id }),
    Activity.deleteMany({ project: req.project._id }),
  ]);

  await req.project.deleteOne();
  res.json({ message: 'Project deleted' });
};

const addMember = async (req, res) => {
  if (!ensureAdmin(req.project, req.user._id, res)) return;

  const { email, role = 'Member' } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const alreadyMember = req.project.members.some((m) => m.user.toString() === user._id.toString());
  if (alreadyMember) {
    return res.status(409).json({ message: 'User already a member' });
  }

  req.project.members.push({ user: user._id, role });
  await req.project.save();
  await req.project.populate('members.user', 'name email');
  res.json(req.project);
};

const removeMember = async (req, res) => {
  if (!ensureAdmin(req.project, req.user._id, res)) return;

  if (req.params.userId === req.user._id.toString()) {
    return res.status(400).json({ message: 'Admins cannot remove themselves' });
  }

  req.project.members = req.project.members.filter((m) => m.user.toString() !== req.params.userId);
  await req.project.save();
  await req.project.populate('members.user', 'name email');
  res.json(req.project);
};

const getActivity = async (req, res) => {
  const activities = await Activity.find({ project: req.project._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(15);

  res.json(activities);
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getActivity,
};
