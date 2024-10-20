import prisma from '../../../prisma/prisma';

export default defineEventHandler(async (event) => {
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

  try {
    const updatedUser = await prisma.user.update({
      where: { id },  
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return updatedUser;

  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw createError({
        statusCode: 409,
        statusMessage: "Email is already in use.",
      });
    }

    if (error.code === 'P2025') {  
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
