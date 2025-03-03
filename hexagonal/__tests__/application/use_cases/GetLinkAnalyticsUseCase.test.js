import GetLinkAnalyticsUseCase from '../../../application/use_cases/GetLinkAnalyticsUseCase.js'
import Link from '../../../domain/models/Link.js'
import Analytics from '../../../domain/models/Analytics.js'
import { LinkNotFoundError } from '../../../domain/exceptions/LinkExceptions.js'

describe('GetLinkAnalyticsUseCase', () => {
  const mockLink = new Link(
    'test-id',
    'https://example.com',
    'abc123',
    10,
    new Date('2023-01-01'),
    new Date('2023-01-02')
  )

  const mockAnalytics = [
    new Analytics(
      'analytics-1',
      'test-id',
      '127.0.0.1',
      'Mozilla/5.0',
      new Date('2023-01-01')
    ),
    new Analytics(
      'analytics-2',
      'test-id',
      '192.168.1.1',
      'Chrome',
      new Date('2023-01-02')
    ),
  ]

  const mockSummary = {
    totalVisits: 10,
    uniqueVisitors: 5,
    visitsByDate: [
      { date: '2023-01-02', count: 5 },
      { date: '2023-01-01', count: 5 },
    ],
  }

  const mockLinkRepository = {
    findById: jest.fn().mockResolvedValue(mockLink),
  }

  const mockAnalyticsRepository = {
    findByLinkId: jest.fn().mockResolvedValue(mockAnalytics),
    getSummaryForLink: jest.fn().mockResolvedValue(mockSummary),
  }

  let getLinkAnalyticsUseCase

  beforeEach(() => {
    mockLinkRepository.findById.mockClear()
    mockAnalyticsRepository.findByLinkId.mockClear()
    mockAnalyticsRepository.getSummaryForLink.mockClear()

    mockLinkRepository.findById.mockResolvedValue(mockLink)
    mockAnalyticsRepository.findByLinkId.mockResolvedValue(mockAnalytics)
    mockAnalyticsRepository.getSummaryForLink.mockResolvedValue(mockSummary)

    getLinkAnalyticsUseCase = new GetLinkAnalyticsUseCase(
      mockLinkRepository,
      mockAnalyticsRepository
    )
  })

  test('should get link analytics successfully', async () => {
    const id = 'test-id'
    const page = 1
    const limit = 10

    const result = await getLinkAnalyticsUseCase.execute(id, page, limit)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)

    const offset = (page - 1) * limit
    expect(mockAnalyticsRepository.findByLinkId).toHaveBeenCalledWith(
      mockLink.id,
      limit,
      offset
    )

    expect(mockAnalyticsRepository.getSummaryForLink).toHaveBeenCalledWith(
      mockLink.id
    )

    expect(result).toEqual({
      link: mockLink.toJSON(),
      analytics: {
        visits: mockLink.visitsCounter,
        details: mockAnalytics.map(a => a.toJSON()),
        summary: mockSummary,
        pagination: {
          page: page,
          limit: limit,
          total: mockLink.visitsCounter,
          totalPages: Math.ceil(mockLink.visitsCounter / limit),
        },
      },
    })
  })

  test('should throw LinkNotFoundError when link is not found', async () => {
    mockLinkRepository.findById.mockResolvedValueOnce(null)

    const id = 'nonexistent'

    await expect(getLinkAnalyticsUseCase.execute(id)).rejects.toThrow(
      LinkNotFoundError
    )
    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockAnalyticsRepository.findByLinkId).not.toHaveBeenCalled()
    expect(mockAnalyticsRepository.getSummaryForLink).not.toHaveBeenCalled()
  })

  test('should handle pagination correctly', async () => {
    const id = 'test-id'
    const page = 2
    const limit = 5

    const result = await getLinkAnalyticsUseCase.execute(id, page, limit)

    const offset = (page - 1) * limit
    expect(mockAnalyticsRepository.findByLinkId).toHaveBeenCalledWith(
      mockLink.id,
      limit,
      offset
    )

    expect(result.analytics.pagination).toEqual({
      page: page,
      limit: limit,
      total: mockLink.visitsCounter,
      totalPages: Math.ceil(mockLink.visitsCounter / limit),
    })
  })

  test('should propagate errors from repositories', async () => {
    const error = new Error('Database error')
    mockAnalyticsRepository.findByLinkId.mockRejectedValueOnce(error)

    const id = 'test-id'

    await expect(getLinkAnalyticsUseCase.execute(id)).rejects.toThrow(error)
    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockAnalyticsRepository.findByLinkId).toHaveBeenCalled()
  })
})
