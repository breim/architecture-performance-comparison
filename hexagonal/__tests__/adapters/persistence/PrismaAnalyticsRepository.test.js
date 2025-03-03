import { PrismaClient } from '@prisma/client'
import PrismaAnalyticsRepository from '../../../adapters/persistence/PrismaAnalyticsRepository.js'
import Analytics from '../../../domain/models/Analytics.js'

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    analytics: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mockPrismaClient) }
})

describe('PrismaAnalyticsRepository', () => {
  let prismaAnalyticsRepository
  let mockPrisma

  beforeEach(() => {
    mockPrisma = new PrismaClient()

    jest.clearAllMocks()

    prismaAnalyticsRepository = new PrismaAnalyticsRepository()
    prismaAnalyticsRepository.prisma = mockPrisma
  })

  describe('create', () => {
    test('should create an analytics entry in the database', async () => {
      const analyticsToCreate = new Analytics(
        null,
        'link-id-123',
        '127.0.0.1',
        'Mozilla/5.0',
        new Date('2023-01-01')
      )

      const createdAnalyticsData = {
        id: 'analytics-id-123',
        linkId: 'link-id-123',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        visitedAt: new Date('2023-01-01'),
      }

      mockPrisma.analytics.create.mockResolvedValueOnce(createdAnalyticsData)

      const result = await prismaAnalyticsRepository.create(analyticsToCreate)

      expect(mockPrisma.analytics.create).toHaveBeenCalledWith({
        data: {
          linkId: analyticsToCreate.linkId,
          ip: analyticsToCreate.ip,
          userAgent: analyticsToCreate.userAgent,
        },
      })

      expect(result).toBeInstanceOf(Analytics)
      expect(result.id).toBe(createdAnalyticsData.id)
      expect(result.linkId).toBe(createdAnalyticsData.linkId)
      expect(result.ip).toBe(createdAnalyticsData.ip)
      expect(result.userAgent).toBe(createdAnalyticsData.userAgent)
      expect(result.visitedAt).toEqual(createdAnalyticsData.visitedAt)
    })
  })

  describe('findByLinkId', () => {
    test('should find analytics entries by link ID with default pagination', async () => {
      const linkId = 'link-id-123'
      const analyticsData = [
        {
          id: 'analytics-id-1',
          linkId: 'link-id-123',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          visitedAt: new Date('2023-01-02'),
        },
        {
          id: 'analytics-id-2',
          linkId: 'link-id-123',
          ip: '192.168.1.1',
          userAgent: 'Chrome/90.0',
          visitedAt: new Date('2023-01-01'),
        },
      ]

      mockPrisma.analytics.findMany.mockResolvedValueOnce(analyticsData)

      const results = await prismaAnalyticsRepository.findByLinkId(linkId)

      expect(mockPrisma.analytics.findMany).toHaveBeenCalledWith({
        where: { linkId },
        orderBy: { visitedAt: 'desc' },
        take: 10,
        skip: 0,
      })

      expect(results).toHaveLength(2)
      expect(results[0]).toBeInstanceOf(Analytics)
      expect(results[1]).toBeInstanceOf(Analytics)

      expect(results[0].id).toBe(analyticsData[0].id)
      expect(results[0].linkId).toBe(analyticsData[0].linkId)
      expect(results[0].ip).toBe(analyticsData[0].ip)
      expect(results[0].userAgent).toBe(analyticsData[0].userAgent)
      expect(results[0].visitedAt).toEqual(analyticsData[0].visitedAt)

      expect(results[1].id).toBe(analyticsData[1].id)
      expect(results[1].linkId).toBe(analyticsData[1].linkId)
      expect(results[1].ip).toBe(analyticsData[1].ip)
      expect(results[1].userAgent).toBe(analyticsData[1].userAgent)
      expect(results[1].visitedAt).toEqual(analyticsData[1].visitedAt)
    })

    test('should find analytics entries by link ID with custom pagination', async () => {
      const linkId = 'link-id-123'
      const limit = 5
      const offset = 10
      const analyticsData = [
        {
          id: 'analytics-id-1',
          linkId: 'link-id-123',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          visitedAt: new Date('2023-01-01'),
        },
      ]

      mockPrisma.analytics.findMany.mockResolvedValueOnce(analyticsData)

      const results = await prismaAnalyticsRepository.findByLinkId(
        linkId,
        limit,
        offset
      )

      expect(mockPrisma.analytics.findMany).toHaveBeenCalledWith({
        where: { linkId },
        orderBy: { visitedAt: 'desc' },
        take: limit,
        skip: offset,
      })

      expect(results).toHaveLength(1)
      expect(results[0]).toBeInstanceOf(Analytics)
      expect(results[0].id).toBe(analyticsData[0].id)
    })

    test('should return an empty array when no analytics entries are found', async () => {
      const linkId = 'nonexistent-link-id'
      mockPrisma.analytics.findMany.mockResolvedValueOnce([])

      const results = await prismaAnalyticsRepository.findByLinkId(linkId)

      expect(mockPrisma.analytics.findMany).toHaveBeenCalledWith({
        where: { linkId },
        orderBy: { visitedAt: 'desc' },
        take: 10,
        skip: 0,
      })
      expect(results).toEqual([])
    })
  })

  describe('getSummaryForLink', () => {
    test('should return a summary of analytics for a link', async () => {
      const linkId = 'link-id-123'
      const totalVisits = 10

      const uniqueVisitors = [
        { ip: '127.0.0.1', _count: 5 },
        { ip: '192.168.1.1', _count: 3 },
        { ip: '10.0.0.1', _count: 2 },
      ]

      const visitDates = [
        { visitedAt: new Date('2023-01-01T10:00:00Z') },
        { visitedAt: new Date('2023-01-01T11:00:00Z') },
        { visitedAt: new Date('2023-01-02T10:00:00Z') },
        { visitedAt: new Date('2023-01-03T10:00:00Z') },
        { visitedAt: new Date('2023-01-03T11:00:00Z') },
      ]

      mockPrisma.analytics.count.mockResolvedValueOnce(totalVisits)
      mockPrisma.analytics.groupBy.mockResolvedValueOnce(uniqueVisitors)
      mockPrisma.analytics.findMany.mockResolvedValueOnce(visitDates)

      const result = await prismaAnalyticsRepository.getSummaryForLink(linkId)

      expect(mockPrisma.analytics.count).toHaveBeenCalledWith({
        where: { linkId },
      })

      expect(mockPrisma.analytics.groupBy).toHaveBeenCalledWith({
        by: ['ip'],
        where: { linkId },
        _count: true,
      })

      expect(mockPrisma.analytics.findMany).toHaveBeenCalledWith({
        where: { linkId },
        select: {
          visitedAt: true,
        },
      })

      expect(result).toEqual({
        totalVisits: 10,
        uniqueVisitors: 3,
        visitsByDate: [
          { date: '2023-01-03', count: 2 },
          { date: '2023-01-02', count: 1 },
          { date: '2023-01-01', count: 2 },
        ],
      })
    })

    test('should return empty summary when no analytics are found', async () => {
      const linkId = 'nonexistent-link-id'

      mockPrisma.analytics.count.mockResolvedValueOnce(0)
      mockPrisma.analytics.groupBy.mockResolvedValueOnce([])
      mockPrisma.analytics.findMany.mockResolvedValueOnce([])

      const result = await prismaAnalyticsRepository.getSummaryForLink(linkId)

      expect(result).toEqual({
        totalVisits: 0,
        uniqueVisitors: 0,
        visitsByDate: [],
      })
    })
  })
})
