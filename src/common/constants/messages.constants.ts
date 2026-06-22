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
    USER_PROFILE_FOUND: 'User profile retrieved successfully',
  },

  SESSION: {
    SESSION_REVOKED: 'Session revoked successfully',
    SESSION_NOT_FOUND: 'Session not found',
    NEW_DEVICE_LOGIN: 'Login detected from new device',
    ALL_SESSIONS_REVOKED: 'All sessions revoked successfully',
    OTHER_SESSIONS_REVOKED: 'All other sessions revoked successfully',
    SESSIONS_RETRIEVED: 'Active sessions retrieved successfully',
    MAX_SESSIONS_REACHED: 'Maximum sessions reached, oldest session revoked',
  },

  APP_CONTEXT: {
    NOT_FOUND: 'Application context not found',
    INVALID: 'Invalid or disabled application context',
    ALREADY_EXISTS: 'Application context already exists',
    DISABLED: 'Application context disabled successfully',
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
    SESSION_IP_MISMATCHED: 'Session validation failed. Please sign in again',
  },
};
