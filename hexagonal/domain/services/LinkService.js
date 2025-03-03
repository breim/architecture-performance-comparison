import { nanoid } from 'nanoid'
import Link from '../models/Link.js'
import { InvalidUrlError } from '../exceptions/LinkExceptions.js'

class LinkService {
  validateUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false
    }

    try {
      const parsedUrl = new URL(url)

      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
    } catch (error) {
      return false
    }
  }

  createLink(originalUrl, codeLength = 7) {
    if (!this.validateUrl(originalUrl)) {
      throw new InvalidUrlError('Invalid URL format')
    }

    const shortCode = nanoid(codeLength)
    return new Link(null, originalUrl, shortCode)
  }
}

export default LinkService
