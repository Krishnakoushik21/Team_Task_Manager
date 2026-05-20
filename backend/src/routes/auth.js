const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  asyncHandler(authController.signup)
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  asyncHandler(authController.login)
);

router.get('/me', auth, authController.me);

module.exports = router;
