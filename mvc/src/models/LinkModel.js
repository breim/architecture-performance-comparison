import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class LinkModel {
  static async findAll() {
    return prisma.link.findMany({
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        createdAt: true,
        _count: {
          select: { analytics: true },
        },
      },
    })
  }

  static async create(data) {
    if (!data.originalUrl) {
      throw new Error('originalUrl is required')
    }
    return prisma.link.create({
      data: {
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
      },
    })
  }

  static async findById(id) {
    return prisma.link.findUnique({
      where: { id },
      include: {
        analytics: {
          orderBy: { visitedAt: 'desc' },
          take: 100,
        },
      },
    })
  }

  static async findByShortCode(shortCode) {
    return prisma.link.findUnique({
      where: { shortCode },
      include: {
        analytics: true,
      },
    })
  }

  static async update(id, data) {
    return prisma.link.update({
      where: { id },
      data,
    })
  }

  static async delete(id) {
    return prisma.link.delete({
      where: { id },
    })
  }

  static async trackAndIncrement(linkId, ip, userAgent) {
    await prisma.$transaction([
      prisma.analytics.create({
        data: {
          linkId,
          ip,
          userAgent,
        },
      }),
      prisma.link.update({
        where: { id: linkId },
        data: { visitsCounter: { increment: 1 } },
      }),
    ])
  }
}

export default LinkModel
