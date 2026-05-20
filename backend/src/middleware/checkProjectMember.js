const Project = require('../models/Project');

const checkProjectMember = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.project || req.query.project;
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID required' });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const role = project.getMemberRole(req.user._id);
  if (!role) {
    return res.status(403).json({ message: 'Not a project member' });
  }

  req.project = project;
  req.projectRole = role;
  next();
};

module.exports = checkProjectMember;
