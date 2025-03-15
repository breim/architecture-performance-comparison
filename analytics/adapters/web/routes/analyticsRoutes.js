import express from 'express'

function setupAnalyticsRoutes(analyticsController) {
  const router = express.Router()

  router.post('/analytics', (req, res) => analyticsController.create(req, res))
  router.get('/analytics/:linkId', (req, res) =>
    analyticsController.getByLinkId(req, res)
  )

  return router
}

export default setupAnalyticsRoutes
