class CreateLinkUseCase {
  constructor(linkService, linkRepository) {
    this.linkService = linkService
    this.linkRepository = linkRepository
  }

  async execute(originalUrl) {
    const link = this.linkService.createLink(originalUrl)

    return await this.linkRepository.create(link)
  }
}

export default CreateLinkUseCase
