const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

/**
 * Generate a secure JWT token
 * @param {Object} payload - Data to include in the token
 * @param {string} type - Token type (access or refresh)
 * @returns {string} JWT token
 */
const generateToken = (payload, type = 'access') => {
  const tokenPayload = {
    ...payload,
    type,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(16).toString('hex') // Unique token ID
  };

  return jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRY || '24h',
      algorithm: 'HS256'
    }
  );
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // Check for minimum complexity requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexityRequirements = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars];
  const passedRequirements = complexityRequirements.filter(Boolean).length;

  if (passedRequirements < 3) {
    return {
      isValid: false,
      message: 'Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters'
    };
  }

  return { isValid: true };
};

const authController = {
  /**
   * Register a new user
   */
  register: async (req, res) => {
    try {
      // Extract data, supporting both snake_case and camelCase
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const first_name = req.body.first_name || req.body.firstName;
      const last_name = req.body.last_name || req.body.lastName;
      const phone = req.body.phone;

      logger.debug(`Registration attempt with fields: ${Object.keys(req.body).join(', ')}`);
      
      // Validate required fields
      if (!username || !email || !password || !first_name || !last_name) {
        return errorResponse(res, 400, 'Missing required fields. Username, email, password, first name, and last name are all required.');
      }

      // Validate email
      if (!validator.isEmail(email)) {
        return errorResponse(res, 400, 'Invalid email format');
      }

      // Validate username
      if (username.length < 3 || username.length > 30) {
        return errorResponse(res, 400, 'Username must be between 3 and 30 characters');
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return errorResponse(res, 400, 'Username can only contain letters, numbers, underscores, dots, and hyphens');
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return errorResponse(res, 400, passwordValidation.message);
      }

      // Check if user already exists
      const existingUser = await userModel.findByCredentials(email);
      if (existingUser) {
        return errorResponse(res, 409, 'User with this email or username already exists');
      }

      // Create new user
      const newUser = await userModel.create({
        username,
        email,
        password,
        first_name,
        last_name,
        phone
      });

      // Generate JWT token
      const token = generateToken({
        userId: newUser.user_id,
        email: newUser.email,
        role: 'user' // Default role
      });

      // Remove sensitive data
      delete newUser.password_hash;

      // Log successful registration
      logger.info(`New user registered: ${username} (ID: ${newUser.user_id})`);

      return successResponse(res, 201, 'User registered successfully', { user: newUser, token });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      return errorResponse(res, 500, 'Error creating user account');
    }
  },

  /**
   * User login
   */
  login: async (req, res) => {
    try {
      const { identifier, password } = req.body;
      
      // Validate input
      if (!identifier || !password) {
        return errorResponse(res, 400, 'Email/username and password are required');
      }

      // Find user by email or username
      const user = await userModel.findByCredentials(identifier);
      if (!user) {
        logger.debug(`Failed login attempt: User not found for identifier "${identifier}"`);
        return errorResponse(res, 401, 'Invalid credentials');
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        logger.debug(`Failed login attempt: Invalid password for user "${user.username}"`);
        return errorResponse(res, 401, 'Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.user_id,
        email: user.email,
        role: user.role || 'user'
      });

      // Remove sensitive data
      delete user.password_hash;

      // Log successful login
      logger.info(`User logged in: ${user.username} (ID: ${user.user_id})`);

      return successResponse(res, 200, 'Login successful', { user, token });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      return errorResponse(res, 500, 'Error during login process');
    }
  },

  /**
   * Change password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 400, 'Current password and new password are required');
      }

      // Validate password strength
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return errorResponse(res, 400, passwordValidation.message);
      }

      // Check if new password is the same as current
      if (currentPassword === newPassword) {
        return errorResponse(res, 400, 'New password must be different from current password');
      }

      // Find user
      const user = await userModel.findById(userId);
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        logger.debug(`Failed password change: Invalid current password for user ID ${userId}`);
        return errorResponse(res, 401, 'Current password is incorrect');
      }

      // Update password
      await userModel.updatePassword(userId, newPassword);

      // Log password change
      logger.info(`Password changed for user: ${user.username} (ID: ${userId})`);

      return successResponse(res, 200, 'Password changed successfully');
    } catch (error) {
      logger.error(`Password change error: ${error.message}`);
      return errorResponse(res, 500, 'Error changing password');
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Find user
      const user = await userModel.findById(userId);
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      // Remove sensitive data
      delete user.password_hash;

      return successResponse(res, 200, 'User profile retrieved successfully', { user });
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      return errorResponse(res, 500, 'Error retrieving user profile');
    }
  },

  //Logout user
  logout: async (req, res) => {
    try { 
      logger.info(`User logged out: ID ${req.user.userId}`);
      return successResponse(res, 200, 'Logged out successfully');
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      return errorResponse(res, 500, 'Error during logout process');
    }
  }
};

module.exports = authController;