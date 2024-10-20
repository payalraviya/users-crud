// server/middleware/auth.ts
import { defineEventHandler, getRequestHeader, createError } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const url = event.node.req.url;
  if (url?.startsWith('/api/auth/login') || url?.startsWith('/login') || url?.startsWith('/register') || url === '/' || url?.startsWith('/api/auth/register')) {
    return;  
  }

  const authorizationHeader = getRequestHeader(event, 'Authorization');
  const token = authorizationHeader?.split(' ')[1];  

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No token provided',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);  

    event.context.user = decoded;

  } catch (error) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Invalid token',
    });
  }
});
