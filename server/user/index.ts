import { RequestHandler } from '~/types/RequestHandler'

export const userPost: RequestHandler = async (prisma, req, res) => {
  const user = prisma.user.create({
    data: req.body
  })

  if (user) res.json(user)
  else res.status(500).send('Could not create user, try again later')
}

export const userGetById: RequestHandler = async (prisma, req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id)
    }
  })

  if (user) res.json(user)
  else res.status(404).send("No user")
}