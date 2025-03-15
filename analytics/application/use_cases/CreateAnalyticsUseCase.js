import Analytics from '../../domain/models/Analytics.js'
import { InvalidAnalyticsDataError } from '../../domain/exceptions/AnalyticsExceptions.js'

class CreateAnalyticsUseCase {
  constructor(analyticsRepository, linkServicePort) {
    this.analyticsRepository = analyticsRepository
    this.linkServicePort = linkServicePort
  }

  async execute(createAnalyticsDTO) {
    try {
      createAnalyticsDTO.validate()

      await this.linkServicePort.verifyLinkExists(createAnalyticsDTO.linkId)

      const analytics = new Analytics(
        null,
        createAnalyticsDTO.linkId,
        createAnalyticsDTO.ip,
        createAnalyticsDTO.userAgent
      )

      const createdAnalytics = await this.analyticsRepository.create(analytics)
      return createdAnalytics
    } catch (error) {
      if (error.message.includes('required')) {
        throw new InvalidAnalyticsDataError(error.message)
      }
      throw error
    }
  }
}

export default CreateAnalyticsUseCase
