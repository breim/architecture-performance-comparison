import { LinkNotFoundError } from '../../domain/exceptions/LinkExceptions.js'

class DeleteLinkUseCase {
  constructor(linkRepository) {
    this.linkRepository = linkRepository
  }

  async execute(id) {
    const link = await this.linkRepository.findById(id)

    if (!link) {
      throw new LinkNotFoundError(`Link with id ${id} not found`)
    }

    await this.linkRepository.delete(link.id)
    return true
  }
}

export default DeleteLinkUseCase
