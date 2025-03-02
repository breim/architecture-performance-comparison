import { nanoid } from 'nanoid'
import Link from '../models/Link.js'
import { InvalidUrlError } from '../exceptions/LinkExceptions.js'

class LinkService {
  validateUrl(url) {
    try {
      new URL(url)
      return true
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
