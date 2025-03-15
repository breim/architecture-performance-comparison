import { PrismaClient } from '@prisma/client'
import Analytics from '../../domain/models/Analytics.js'
import AnalyticsRepository from '../../domain/repositories/AnalyticsRepository.js'

class PrismaAnalyticsRepository extends AnalyticsRepository {
  constructor() {
    super()
    this.prisma = new PrismaClient()
  }

  async create(analytics) {
    const createdAnalytics = await this.prisma.analytics.create({
      data: {
        linkId: analytics.linkId,
        ip: analytics.ip,
        userAgent: analytics.userAgent,
      },
    })

    return new Analytics(
      createdAnalytics.id,
      createdAnalytics.linkId,
      createdAnalytics.ip,
      createdAnalytics.userAgent,
      createdAnalytics.visitedAt
    )
  }

  async findByLinkId(linkId, limit = 10, offset = 0) {
    const analyticsEntries = await this.prisma.analytics.findMany({
      where: { linkId },
      orderBy: { visitedAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return analyticsEntries.map(
      entry =>
        new Analytics(
          entry.id,
          entry.linkId,
          entry.ip,
          entry.userAgent,
          entry.visitedAt
        )
    )
  }

  async countByLinkId(linkId) {
    const count = await this.prisma.analytics.count({
      where: { linkId },
    })

    return count
  }
}

export default PrismaAnalyticsRepository
