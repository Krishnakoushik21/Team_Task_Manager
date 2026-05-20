require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const seedDemo = async () => {
  await connectDB();

  const existingProjects = await Project.find({ name: 'Demo Launch Plan' }).select('_id');
  const existingProjectIds = existingProjects.map((project) => project._id);

  if (existingProjectIds.length > 0) {
    await Task.deleteMany({ project: { $in: existingProjectIds } });
    await Activity.deleteMany({ project: { $in: existingProjectIds } });
    await Project.deleteMany({ _id: { $in: existingProjectIds } });
  }

  await User.deleteMany({ email: { $in: ['admin@demo.com', 'member@demo.com'] } });

  const admin = await User.create({
    name: 'Admin Demo',
    email: 'admin@demo.com',
    password: 'demo1234',
  });

  const member = await User.create({
    name: 'Member Demo',
    email: 'member@demo.com',
    password: 'demo1234',
  });

  const project = await Project.create({
    name: 'Demo Launch Plan',
    description: 'A sample workspace for the assignment walkthrough.',
    createdBy: admin._id,
    members: [
      { user: admin._id, role: 'Admin' },
      { user: member._id, role: 'Member' },
    ],
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await Task.create([
    {
      title: 'Prepare demo video outline',
      description: 'Capture the login, project, board, members, and dashboard flow.',
      project: project._id,
      assignee: admin._id,
      createdBy: admin._id,
      priority: 'High',
      status: 'In Progress',
      dueDate: tomorrow,
    },
    {
      title: 'Verify member permissions',
      description: 'Confirm members can only update status on assigned tasks.',
      project: project._id,
      assignee: member._id,
      createdBy: admin._id,
      priority: 'Medium',
      status: 'To Do',
      dueDate: tomorrow,
    },
    {
      title: 'Write README deployment notes',
      project: project._id,
      assignee: admin._id,
      createdBy: admin._id,
      priority: 'Low',
      status: 'Done',
      dueDate: yesterday,
    },
  ]);

  await Activity.create({
    project: project._id,
    user: admin._id,
    action: 'created task',
    taskTitle: 'Prepare demo video outline',
  });

  console.log('Demo data seeded');
  process.exit(0);
};

seedDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
