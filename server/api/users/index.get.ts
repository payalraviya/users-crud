import prisma from '../../../prisma/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()
  return users
})
