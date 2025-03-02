import { LinkNotFoundError } from '../../domain/exceptions/LinkExceptions.js'
import Analytics from '../../domain/models/Analytics.js'

class RedirectLinkUseCase {
  constructor(linkRepository, analyticsRepository) {
    this.linkRepository = linkRepository
    this.analyticsRepository = analyticsRepository
  }

  async execute(shortCode, ip, userAgent) {
    const link = await this.linkRepository.findByShortCode(shortCode)

    if (!link) {
      throw new LinkNotFoundError(`Link with short code ${shortCode} not found`)
    }

    link.incrementVisits()
    await this.linkRepository.update(link)

    const analytics = new Analytics(null, link.id, ip, userAgent)
    await this.analyticsRepository.create(analytics)

    return link.originalUrl
  }
}

export default RedirectLinkUseCase
