import express from 'express'

function setupLinkRoutes(linkController) {
  const router = express.Router()

  router.get('/links', (req, res) => linkController.index(req, res))
  router.post('/links', (req, res) => linkController.create(req, res))
  router.get('/links/:id', (req, res) => linkController.show(req, res))
  router.patch('/links/:id', (req, res) => linkController.update(req, res))
  router.delete('/links/:id', (req, res) => linkController.delete(req, res))
  router.get('/links/:id/analytics', (req, res) =>
    linkController.getAnalytics(req, res)
  )

  return router
}

export default setupLinkRoutes
