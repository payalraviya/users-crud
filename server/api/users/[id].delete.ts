import prisma from '../../../prisma/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id; 

  if (!id || typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing user ID.",
    });
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id }, 
    });

    return deletedUser;

  } catch (error ) {
    if (error.code === 'P2025') {  
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
