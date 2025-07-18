// User role constants
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  ANALYST: 'analyst',
  API_USER: 'api_user'
};

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 5,
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.EDITOR]: 3,
  [USER_ROLES.ANALYST]: 2,
  [USER_ROLES.API_USER]: 1
};

// Role permissions
const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'system.manage',
    'users.manage',
    'content.manage',
    'reports.generate',
    'api.full_access'
  ],
  [USER_ROLES.ADMIN]: [
    'users.manage',
    'content.manage',
    'reports.generate',
    'api.full_access'
  ],
  [USER_ROLES.EDITOR]: [
    'content.edit',
    'content.create',
    'reports.view',
    'api.write'
  ],
  [USER_ROLES.ANALYST]: [
    'content.view',
    'reports.view',
    'api.read'
  ],
  [USER_ROLES.API_USER]: [
    'api.read'
  ]
};

module.exports = {
  USER_ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS
};