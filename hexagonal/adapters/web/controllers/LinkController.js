import {
  InvalidUrlError,
  LinkNotFoundError,
} from '../../../domain/exceptions/LinkExceptions.js'

class LinkController {
  constructor(
    createLinkUseCase,
    redirectLinkUseCase,
    getLinkAnalyticsUseCase,
    getAllLinksUseCase,
    getLinkByIdUseCase,
    updateLinkUseCase,
    deleteLinkUseCase
  ) {
    this.createLinkUseCase = createLinkUseCase
    this.redirectLinkUseCase = redirectLinkUseCase
    this.getLinkAnalyticsUseCase = getLinkAnalyticsUseCase
    this.getAllLinksUseCase = getAllLinksUseCase
    this.getLinkByIdUseCase = getLinkByIdUseCase
    this.updateLinkUseCase = updateLinkUseCase
    this.deleteLinkUseCase = deleteLinkUseCase
  }

  async index(req, res) {
    try {
      const links = await this.getAllLinksUseCase.execute()

      const formattedLinks = links.map(link => {
        const linkJson = link.toJSON()

        if (req.get && req.protocol) {
          linkJson.shortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}`
        }

        return linkJson
      })

      return res.status(200).json(formattedLinks)
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async create(req, res) {
    try {
      const { originalUrl } = req.body

      if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' })
      }

      const link = await this.createLinkUseCase.execute(originalUrl)

      const response = {
        id: link.id,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        visitsCounter: link.visitsCounter,
        createdAt: link.createdAt,
      }

      if (req.get && req.protocol) {
        response.shortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}`
      }

      return res.status(201).json(response)
    } catch (error) {
      if (error instanceof InvalidUrlError) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params

      const link = await this.getLinkByIdUseCase.execute(id)

      const response = link.toJSON()

      if (req.get && req.protocol) {
        response.shortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}`
      }

      return res.status(200).json(response)
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params
      const { originalUrl } = req.body

      if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' })
      }

      const updatedLink = await this.updateLinkUseCase.execute(id, originalUrl)

      return res.status(200).json({
        ...updatedLink.toJSON(),
        shortUrl: `${req.protocol}://${req.get('host')}/${updatedLink.shortCode}`,
      })
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }

      if (error instanceof InvalidUrlError) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params

      await this.deleteLinkUseCase.execute(id)

      return res.status(204).send()
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async redirectLink(req, res) {
    try {
      const { shortCode } = req.params
      const ip = req.clientIp || req.socket.remoteAddress
      const userAgent = req.useragent
        ? req.useragent.source
        : req.get('User-Agent')

      const originalUrl = await this.redirectLinkUseCase.execute(
        shortCode,
        ip,
        userAgent
      )

      return res.redirect(originalUrl)
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async getAnalytics(req, res) {
    try {
      const { id } = req.params
      const { page = 1, limit = 10 } = req.query

      const analytics = await this.getLinkAnalyticsUseCase.execute(
        id,
        parseInt(page),
        parseInt(limit)
      )

      return res.status(200).json(analytics)
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }

      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export default LinkController
