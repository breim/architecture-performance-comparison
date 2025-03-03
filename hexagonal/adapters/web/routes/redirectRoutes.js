import express from 'express'

function setupRedirectRoutes(linkController) {
  const router = express.Router()

  router.get('/:shortCode', (req, res) => linkController.redirectLink(req, res))

  return router
}

export default setupRedirectRoutes
