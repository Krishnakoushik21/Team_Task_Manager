const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const checkProjectMember = require('../middleware/checkProjectMember');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get(
  '/project/:projectId',
  auth,
  asyncHandler(checkProjectMember),
  asyncHandler(taskController.getProjectTasks)
);

router.post(
  '/',
  auth,
  [
    body('title').notEmpty().trim().withMessage('Title required'),
    body('project').notEmpty().withMessage('Project ID required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  ],
  validateRequest,
  asyncHandler(checkProjectMember),
  asyncHandler(taskController.createTask)
);

router.get(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Valid task ID required')],
  validateRequest,
  asyncHandler(taskController.getTask)
);

router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Valid task ID required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  ],
  validateRequest,
  asyncHandler(taskController.updateTask)
);

router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Valid task ID required')],
  validateRequest,
  asyncHandler(taskController.deleteTask)
);

module.exports = router;
