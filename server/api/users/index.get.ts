import prisma from '../../../prisma/prisma';
import authMiddleware from '../../middleware/auth';

export default defineEventHandler(async (event) => {
  await authMiddleware(event);  // Check auth

  const users = await prisma.user.findMany();
  return users;
});
