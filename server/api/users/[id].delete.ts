import prisma from '../../../prisma/prisma'

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id

  const deletedUser = await prisma.user.delete({
    where: { id: parseInt(id) },
  })

  return deletedUser
})
