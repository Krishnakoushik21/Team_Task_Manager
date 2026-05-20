const express = require('express');
const { query } = require('express-validator');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const checkProjectMember = require('../middleware/checkProjectMember');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get(
  '/stats',
  auth,
  [query('project').notEmpty().withMessage('project query param required')],
  validateRequest,
  asyncHandler(checkProjectMember),
  asyncHandler(dashboardController.getStats)
);

module.exports = router;
