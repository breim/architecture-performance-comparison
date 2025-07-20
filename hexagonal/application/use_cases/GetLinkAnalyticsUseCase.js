import { LinkNotFoundError } from '../../domain/exceptions/LinkExceptions.js'

class GetLinkAnalyticsUseCase {
  constructor(linkRepository, analyticsServicePort) {
    this.linkRepository = linkRepository
    this.analyticsServicePort = analyticsServicePort
  }

  async execute(id, page = 1, limit = 10) {
    const link = await this.linkRepository.findById(id)

    if (!link) {
      throw new LinkNotFoundError(`Link with id ${id} not found`)
    }

    /* istanbul ignore next */
    let analyticsData = null
    /* istanbul ignore next */
    if (this.analyticsServicePort) {
      try {
        analyticsData = await this.analyticsServicePort.getAnalytics(
          link.id,
          page,
          limit
        )
      } catch (error) {
        throw error
      }
    }

    /* istanbul ignore next */
    if (analyticsData) {
      return analyticsData
    }

    /* istanbul ignore next */
    return {
      link: link.toJSON(),
      analytics: {
        visits: link.visitsCounter,
        details: [],
        summary: {
          totalVisits: link.visitsCounter,
          uniqueVisitors: 0,
          visitsByDate: [],
        },
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
