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

  async getSummaryForLink(linkId) {
    const totalVisits = await this.prisma.analytics.count({
      where: { linkId },
    })

    const uniqueVisitors = await this.prisma.analytics.groupBy({
      by: ['ip'],
      where: { linkId },
      _count: true,
    })

    const visitDates = await this.prisma.analytics.findMany({
      where: { linkId },
      select: {
        visitedAt: true,
      },
    })

    const dateMap = new Map()
    visitDates.forEach(visit => {
      const dateStr = visit.visitedAt.toISOString().split('T')[0]
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1)
    })

    const visitsByDate = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return {
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      visitsByDate,
    }
  }
}

export default PrismaAnalyticsRepository
