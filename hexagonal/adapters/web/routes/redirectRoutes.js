import express from 'express'

/**
 * Configure redirect routes
 * @param {LinkController} linkController - Controller for link endpoints
 * @returns {Router} Express router
 */
function setupRedirectRoutes(linkController) {
  const router = express.Router()

  // Redirect to the original URL
  router.get('/:shortCode', (req, res) => linkController.redirectLink(req, res))

  return router
}

export default setupRedirectRoutes
