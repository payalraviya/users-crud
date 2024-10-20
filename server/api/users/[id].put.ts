import prisma from '../../../prisma/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;  
  const body = await readBody(event);

  // Validate name
  if (!body.name || typeof body.name !== 'string' || body.name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name is required and must be a string with a maximum length of 100 characters.",
    });
  }

  // Validate email
  if (!body.email || typeof body.email !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid email is required.",
    });
  }

  // Check if id is defined and is a string
  if (typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID must be a valid string.",
    });
  }

  // Convert id to a number
  const userId = parseInt(id, 10); // Convert id to an integer
  if (isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID must be a valid number.",
    });
  }

  try {
    // Update user with the converted userId
    const updatedUser = await prisma.user.update({
      where: { id: userId },  // Use the integer userId here
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return updatedUser;

  } catch (error) {
    const prismaError = error as { code?: string; meta?: { target?: string[] } };

    // Handle unique constraint violation for email
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
      throw createError({
        statusCode: 409,
        statusMessage: "Email is already in use.",
      });
    }

    // Handle user not found error
    if (prismaError.code === 'P2025') {  
      throw createError({
        statusCode: 404,
        statusMessage: "User not found.",
      });
    }

    // Handle generic error
    throw createError({
      statusCode: 500,
      statusMessage: "An error occurred while updating the user.",
    });
  }
});
