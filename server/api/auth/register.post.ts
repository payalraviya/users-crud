// server/api/auth/register.post.ts
import prisma from '../../../prisma/prisma';
import jwt from 'jsonwebtoken';
import { createError } from 'h3'; 

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A valid email is required.',
    });
  }

  if (!body.name || typeof body.name !== 'string' || body.name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required and must be a string with a maximum length of 100 characters.',
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Email is already in use.',
    });
  }

  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
    },
  });

  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email },
    secret,
    { expiresIn: '2h' } 
  );

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    token,
  };
});
