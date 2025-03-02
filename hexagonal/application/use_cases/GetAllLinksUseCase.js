class GetAllLinksUseCase {
  constructor(linkRepository) {
    this.linkRepository = linkRepository
  }

  async execute() {
    return await this.linkRepository.findAll()
  }
}

export default GetAllLinksUseCase
