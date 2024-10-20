// server/api/auth/login.post.ts
import prisma from '../../../prisma/prisma';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email',
    });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const token = jwt.sign(
    { id: user.id, email: user.email },  
    secret,  
    { expiresIn: '1h' }  
  );

  return { token };
});
