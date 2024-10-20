import prisma from '../../../prisma/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id; 

  if (typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing user ID.",
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
    const deletedUser = await prisma.user.delete({
      where: { id: userId }, 
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
