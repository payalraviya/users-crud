import prisma from '../../../prisma/prisma'

export default defineEventHandler(async (event) => {
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
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return newUser;
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw createError({
        statusCode: 409,
        statusMessage: "Email is already in use.",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "An error occurred while creating the user.",
    });
  }
});
