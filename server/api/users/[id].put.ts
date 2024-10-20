import prisma from '../../../prisma/prisma';
import authMiddleware from '../../middleware/auth';

export default defineEventHandler(async (event) => {
  await authMiddleware(event);  // Check auth

  const id = event.context.params?.id;
  const body = await readBody(event);

  if (!body.name || typeof body.name !== 'string' || body.name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name is required and must be a string with a maximum length of 100 characters.",
    });
  }

  if (!body.email || typeof body.email !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid email is required.",
    });
  }

  if (typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID must be a valid string.",
    });
  }

  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID must be a valid number.",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return updatedUser;
  } catch (error) {
    const prismaError = error as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
      throw createError({
        statusCode: 409,
        statusMessage: "Email is already in use.",
      });
    }

    if (prismaError.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found.",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "An error occurred while updating the user.",
    });
  }
});
