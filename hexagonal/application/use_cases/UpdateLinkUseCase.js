import {
  InvalidUrlError,
  LinkNotFoundError,
} from '../../domain/exceptions/LinkExceptions.js'

class UpdateLinkUseCase {
  constructor(linkService, linkRepository) {
    this.linkService = linkService
    this.linkRepository = linkRepository
  }

  async execute(id, originalUrl) {
    if (!originalUrl) {
      throw new Error('Original URL is required')
    }

    const link = await this.linkRepository.findById(id)

    if (!link) {
      throw new LinkNotFoundError(`Link with id ${id} not found`)
    }

    if (!this.linkService.validateUrl(originalUrl)) {
      throw new InvalidUrlError('Invalid URL format')
    }

    link.originalUrl = originalUrl
    link.updatedAt = new Date()

    return await this.linkRepository.update(link)
  }
}

export default UpdateLinkUseCase
