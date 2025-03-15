import { LinkNotFoundError } from '../../domain/exceptions/AnalyticsExceptions.js'

class GetAnalyticsUseCase {
  constructor(analyticsRepository, linkServicePort) {
    this.analyticsRepository = analyticsRepository
    this.linkServicePort = linkServicePort
  }

  async execute(getAnalyticsDTO) {
    getAnalyticsDTO.validate()

    const link = await this.linkServicePort.verifyLinkExists(
      getAnalyticsDTO.linkId
    )

    const totalVisits = await this.analyticsRepository.countByLinkId(
      getAnalyticsDTO.linkId
    )

    const analytics = await this.analyticsRepository.findByLinkId(
      getAnalyticsDTO.linkId,
      getAnalyticsDTO.limit,
      getAnalyticsDTO.getOffset()
    )

    return {
      link,
      analytics: {
        visits: totalVisits,
        details: analytics.map(a => a.toJSON()),
        pagination: {
          page: getAnalyticsDTO.page,
          limit: getAnalyticsDTO.limit,
          total: totalVisits,
          totalPages: Math.ceil(totalVisits / getAnalyticsDTO.limit) || 1,
        },
      },
    }
  }
}

export default GetAnalyticsUseCase
