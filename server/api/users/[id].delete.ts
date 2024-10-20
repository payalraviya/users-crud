import prisma from '../../../prisma/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id; 

  // Validate that id is a string and then convert to a number
  if (typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing user ID.",
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
    // Delete user using the converted userId
    const deletedUser = await prisma.user.delete({
      where: { id: userId }, 
    });

    return deletedUser;

  } catch (error) {
    // Use a type assertion to specify the expected error type
    const prismaError = error as { code?: string };  // Type assertion for Prisma error

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
      statusMessage: "An error occurred while deleting the user.",
    });
  }
});
