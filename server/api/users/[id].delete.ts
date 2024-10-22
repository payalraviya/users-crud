import prisma from '../../../prisma/prisma';
import authMiddleware from '../../middleware/auth';

export default defineEventHandler(async (event) => {
  await authMiddleware(event);  // Check auth

  const id = event.context?.params?.id;

  if (typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing user ID.",
    });
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: id },
    });

    return deletedUser;
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found.",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "An error occurred while deleting the user.",
    });
  }
});
