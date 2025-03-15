import { LinkNotFoundError } from '../../domain/exceptions/AnalyticsExceptions.js'
import LinkServicePort from '../../application/interfaces/LinkServicePort.js'

class LinkServiceAdapter extends LinkServicePort {
  constructor(baseUrl) {
    super()
    this.baseUrl = baseUrl
  }

  async verifyLinkExists(linkId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/links/${linkId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new LinkNotFoundError(`Link with id ${linkId} not found`)
        }
        throw new Error(`Failed to verify link: ${response.statusText}`)
      }

      const link = await response.json()
      return link
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        throw error
      }
      throw new Error(`Error connecting to link service: ${error.message}`)
    }
  }
}

export default LinkServiceAdapter
