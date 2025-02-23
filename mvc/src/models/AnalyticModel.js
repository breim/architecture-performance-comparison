import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class AnalyticModel {
  static async findAnalyticsByLinkId(linkId, limit, offset) {
    return prisma.analytics.findMany({
      where: { linkId },
      orderBy: { visitedAt: 'desc' },
      take: limit,
      skip: offset,
    })
  }
}

export default AnalyticModel
