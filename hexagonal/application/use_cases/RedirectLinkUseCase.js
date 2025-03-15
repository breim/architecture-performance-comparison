import { LinkNotFoundError } from '../../domain/exceptions/LinkExceptions.js'

class RedirectLinkUseCase {
  constructor(linkRepository, analyticsServicePort) {
    this.linkRepository = linkRepository
    this.analyticsServicePort = analyticsServicePort
  }

  async execute(shortCode, ip, userAgent) {
    const link = await this.linkRepository.findByShortCode(shortCode)

    if (!link) {
      throw new LinkNotFoundError(`Link with short code ${shortCode} not found`)
    }

    link.incrementVisits()
    await this.linkRepository.update(link)

    if (this.analyticsServicePort) {
      try {
        await this.analyticsServicePort.trackVisit(link.id, ip, userAgent)
      } catch (error) {
        console.error('Error tracking visit in analytics service:', error)
      }
    }

    return link.originalUrl
  }
}

export default RedirectLinkUseCase
