import { PrismaClient } from '@prisma/client'
import AnalyticModel from '../../src/models/AnalyticModel.js'

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    analytics: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
  return { PrismaClient: jest.fn(() => mockPrisma) }
})

describe('AnalyticModel', () => {
  let prisma

  beforeAll(() => {
    prisma = new PrismaClient()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('should retrieve analytics by linkId with pagination', async () => {
    const linkId = '123'
    const limit = 10
    const offset = 0

    const mockAnalytics = [
      {
        id: '1',
        linkId,
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        visitedAt: new Date('2024-02-23T12:00:00Z'),
      },
      {
        id: '2',
        linkId,
        ip: '10.0.0.1',
        userAgent: 'Chrome/108.0',
        visitedAt: new Date('2024-02-22T15:30:00Z'),
      },
    ]

    prisma.analytics.findMany.mockResolvedValue(mockAnalytics)

    const result = await AnalyticModel.findAnalyticsByLinkId(
      linkId,
      limit,
      offset
    )

    expect(prisma.analytics.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.analytics.findMany).toHaveBeenCalledWith({
      where: { linkId },
      orderBy: { visitedAt: 'desc' },
      take: limit,
      skip: offset,
    })
    expect(result).toEqual(mockAnalytics)
  })

  test('should return an empty array when no analytics are found', async () => {
    prisma.analytics.findMany.mockResolvedValue([])

    const result = await AnalyticModel.findAnalyticsByLinkId(
      'nonexistent-id',
      10,
      0
    )

    expect(result).toEqual([])
  })
})
