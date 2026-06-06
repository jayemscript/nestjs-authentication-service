//src/common/constants/messages.constants.ts
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid email/username or password',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    REGISTER_FAILED: 'Registration failed',
    REFRESH_SUCCESS: 'Token refreshed successfully',
    REFRESH_FAILED: 'Failed to refresh token',
    PASSWORD_RESET_REQUESTED: 'Password reset instructions sent',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    PASSWORD_RESET_FAILED: 'Password reset failed',
  },

  USER: {
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'User already exists',
    ACCOUNT_DEACTIVATED: 'Account has been deactivated',
    ACCOUNT_LOCKED: 'Account is locked due to multiple failed login attempts',
    EMAIL_NOT_VERIFIED: 'Email not verified',
    PROFILE_UPDATED: 'Profile updated successfully',
  },

  SESSION: {
    SESSION_REVOKED: 'Session revoked successfully',
    SESSION_NOT_FOUND: 'Session not found',
    NEW_DEVICE_LOGIN: 'Login detected from new device',
  },

  VALIDATION: {
    INVALID_EMAIL: 'Invalid email format',
    INVALID_USERNAME:
      'Username must be 3-20 characters, alphanumeric and underscore only',
    WEAK_PASSWORD: 'Password must be at least 8 characters',
    PASSWORD_MISMATCH: 'Passwords do not match',
    REQUIRED_FIELD: 'This field is required',
  },

  ERROR: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    BAD_REQUEST: 'Bad request',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_EXPIRED: 'Token has expired',
  },
};