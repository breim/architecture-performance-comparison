import Analytics from '../../../domain/models/Analytics.js'

describe('Analytics Model', () => {
  const mockData = {
    id: 'test-id',
    linkId: 'link-id',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    visitedAt: new Date('2023-01-01'),
  }

  test('should create an Analytics instance with correct properties', () => {
    const analytics = new Analytics(
      mockData.id,
      mockData.linkId,
      mockData.ip,
      mockData.userAgent,
      mockData.visitedAt
    )

    expect(analytics.id).toBe(mockData.id)
    expect(analytics.linkId).toBe(mockData.linkId)
    expect(analytics.ip).toBe(mockData.ip)
    expect(analytics.userAgent).toBe(mockData.userAgent)
    expect(analytics.visitedAt).toEqual(mockData.visitedAt)
  })

  test('should create an Analytics instance with default visitedAt if not provided', () => {
    const now = new Date()
    const analytics = new Analytics(
      mockData.id,
      mockData.linkId,
      mockData.ip,
      mockData.userAgent
    )

    const diff = Math.abs(analytics.visitedAt.getTime() - now.getTime())
    expect(diff).toBeLessThan(100)
  })

  test('should convert to JSON correctly', () => {
    const analytics = new Analytics(
      mockData.id,
      mockData.linkId,
      mockData.ip,
      mockData.userAgent,
      mockData.visitedAt
    )

    const json = analytics.toJSON()

    expect(json).toEqual({
      id: mockData.id,
      linkId: mockData.linkId,
      ip: mockData.ip,
      userAgent: mockData.userAgent,
      visitedAt: mockData.visitedAt,
    })
  })
}) 