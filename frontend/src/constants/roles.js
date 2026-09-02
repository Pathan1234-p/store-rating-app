export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  STORE_OWNER: 'STORE_OWNER',
};

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.USER]: '/stores',
  [ROLES.STORE_OWNER]: '/owner',
};
