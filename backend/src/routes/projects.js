const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const checkProjectMember = require('../middleware/checkProjectMember');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.get('/', auth, asyncHandler(projectController.listProjects));

router.post(
  '/',
  auth,
  [body('name').notEmpty().trim().withMessage('Project name required')],
  validateRequest,
  asyncHandler(projectController.createProject)
);

router.get('/:id', auth, asyncHandler(checkProjectMember), asyncHandler(projectController.getProject));

router.put('/:id', auth, asyncHandler(checkProjectMember), asyncHandler(projectController.updateProject));

router.delete('/:id', auth, asyncHandler(checkProjectMember), asyncHandler(projectController.deleteProject));

router.post(
  '/:id/members',
  auth,
  [
    body('email').isEmail().normalizeEmail(),
    body('role').optional().isIn(['Admin', 'Member']),
  ],
  validateRequest,
  asyncHandler(checkProjectMember),
  asyncHandler(projectController.addMember)
);

router.delete(
  '/:id/members/:userId',
  auth,
  asyncHandler(checkProjectMember),
  asyncHandler(projectController.removeMember)
);

router.get(
  '/:id/activity',
  auth,
  asyncHandler(checkProjectMember),
  asyncHandler(projectController.getActivity)
);

module.exports = router;
