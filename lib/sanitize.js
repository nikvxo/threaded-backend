export function sanitizeUser(user) {
  if (!user || typeof user !== 'object') {
    throw new TypeError('sanitizeUser: invalid user'); 
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}