import { LinkNotFoundError } from '../../domain/exceptions/LinkExceptions.js'

class GetLinkByIdUseCase {
  constructor(linkRepository) {
    this.linkRepository = linkRepository
  }

  async execute(id) {
    const link = await this.linkRepository.findById(id)

    if (!link) {
      throw new LinkNotFoundError(`Link with id ${id} not found`)
    }

    return link
  }
}

export default GetLinkByIdUseCase
