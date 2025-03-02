import { LinkNotFoundError } from '../../domain/exceptions/LinkExceptions.js'

class GetLinkAnalyticsUseCase {
  constructor(linkRepository, analyticsRepository) {
    this.linkRepository = linkRepository
    this.analyticsRepository = analyticsRepository
  }

  async execute(id, page = 1, limit = 10) {
    const link = await this.linkRepository.findById(id)

    if (!link) {
      throw new LinkNotFoundError(`Link with id ${id} not found`)
    }

    const offset = (page - 1) * limit
    const analytics = await this.analyticsRepository.findByLinkId(
      link.id,
      limit,
      offset
    )
    const summary = await this.analyticsRepository.getSummaryForLink(link.id)

    return {
      link: link.toJSON(),
      analytics: {
        visits: link.visitsCounter,
        details: analytics.map(a => a.toJSON()),
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: link.visitsCounter,
          totalPages: Math.ceil(link.visitsCounter / limit),
        },
      },
    }
  }
}

export default GetLinkAnalyticsUseCase
