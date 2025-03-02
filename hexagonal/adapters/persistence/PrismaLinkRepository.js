import { PrismaClient } from '@prisma/client'
import Link from '../../domain/models/Link.js'
import LinkRepository from '../../domain/repositories/LinkRepository.js'

class PrismaLinkRepository extends LinkRepository {
  constructor() {
    super()
    this.prisma = new PrismaClient()
  }

  async create(link) {
    const createdLink = await this.prisma.link.create({
      data: {
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        visitsCounter: link.visitsCounter || 0,
      },
    })

    return new Link(
      createdLink.id,
      createdLink.originalUrl,
      createdLink.shortCode,
      createdLink.visitsCounter,
      createdLink.createdAt,
      createdLink.updatedAt
    )
  }

  async findById(id) {
    const link = await this.prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return null
    }

    return new Link(
      link.id,
      link.originalUrl,
      link.shortCode,
      link.visitsCounter,
      link.createdAt,
      link.updatedAt
    )
  }

  async findByShortCode(shortCode) {
    const link = await this.prisma.link.findUnique({
      where: { shortCode },
    })

    if (!link) {
      return null
    }

    return new Link(
      link.id,
      link.originalUrl,
      link.shortCode,
      link.visitsCounter,
      link.createdAt,
      link.updatedAt
    )
  }

  async update(link) {
    const updatedLink = await this.prisma.link.update({
      where: { id: link.id },
      data: {
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        visitsCounter: link.visitsCounter,
        updatedAt: new Date(),
      },
    })

    return new Link(
      updatedLink.id,
      updatedLink.originalUrl,
      updatedLink.shortCode,
      updatedLink.visitsCounter,
      updatedLink.createdAt,
      updatedLink.updatedAt
    )
  }

  async delete(id) {
    await this.prisma.link.delete({
      where: { id },
    })
    return true
  }

  async findAll() {
    const links = await this.prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return links.map(
      link =>
        new Link(
          link.id,
          link.originalUrl,
          link.shortCode,
          link.visitsCounter,
          link.createdAt,
          link.updatedAt
        )
    )
  }
}

export default PrismaLinkRepository
