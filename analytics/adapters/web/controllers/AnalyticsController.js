import CreateAnalyticsDTO from '../../../application/dto/CreateAnalyticsDTO.js'
import GetAnalyticsDTO from '../../../application/dto/GetAnalyticsDTO.js'
import {
  LinkNotFoundError,
  InvalidAnalyticsDataError,
} from '../../../domain/exceptions/AnalyticsExceptions.js'

class AnalyticsController {
  constructor(createAnalyticsUseCase, getAnalyticsUseCase) {
    this.createAnalyticsUseCase = createAnalyticsUseCase
    this.getAnalyticsUseCase = getAnalyticsUseCase
  }

  async create(req, res) {
    try {
      const { linkId } = req.body
      const ip = req.clientIp || req.socket.remoteAddress
      const userAgent = req.useragent
        ? req.useragent.source
        : req.get('User-Agent')

      const createAnalyticsDTO = new CreateAnalyticsDTO(linkId, ip, userAgent)

      const analytics =
        await this.createAnalyticsUseCase.execute(createAnalyticsDTO)

      return res.status(201).json(analytics.toJSON())
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }
      if (error instanceof InvalidAnalyticsDataError) {
        return res.status(400).json({ error: error.message })
      }
      console.error('Error creating analytics:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async getByLinkId(req, res) {
    try {
      const { linkId } = req.params
      const { page = 1, limit = 10 } = req.query

      const getAnalyticsDTO = new GetAnalyticsDTO(linkId, page, limit)

      const result = await this.getAnalyticsUseCase.execute(getAnalyticsDTO)

      return res.status(200).json(result)
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return res.status(404).json({ error: 'Link not found' })
      }
      console.error('Error getting analytics:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export default AnalyticsController
