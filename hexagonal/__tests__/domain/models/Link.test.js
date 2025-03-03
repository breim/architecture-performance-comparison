import Link from '../../../domain/models/Link.js'

describe('Link Model', () => {
  const mockData = {
    id: 'test-id',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    visitsCounter: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  test('should create a Link instance with correct properties', () => {
    const link = new Link(
      mockData.id,
      mockData.originalUrl,
      mockData.shortCode,
      mockData.visitsCounter,
      mockData.createdAt,
      mockData.updatedAt
    )

    expect(link.id).toBe(mockData.id)
    expect(link.originalUrl).toBe(mockData.originalUrl)
    expect(link.shortCode).toBe(mockData.shortCode)
    expect(link.visitsCounter).toBe(mockData.visitsCounter)
    expect(link.createdAt).toEqual(mockData.createdAt)
    expect(link.updatedAt).toEqual(mockData.updatedAt)
  })

  test('should increment visits counter', () => {
    const link = new Link(
      mockData.id,
      mockData.originalUrl,
      mockData.shortCode,
      mockData.visitsCounter,
      mockData.createdAt,
      mockData.updatedAt
    )

    const initialCounter = link.visitsCounter
    const initialUpdatedAt = link.updatedAt

    setTimeout(() => {
      const updatedLink = link.incrementVisits()

      expect(updatedLink.visitsCounter).toBe(initialCounter + 1)
      expect(updatedLink.updatedAt).not.toEqual(initialUpdatedAt)
      expect(updatedLink).toBe(link)
    }, 10)
  })

  test('should convert to JSON correctly', () => {
    const link = new Link(
      mockData.id,
      mockData.originalUrl,
      mockData.shortCode,
      mockData.visitsCounter,
      mockData.createdAt,
      mockData.updatedAt
    )

    const json = link.toJSON()

    expect(json).toEqual({
      id: mockData.id,
      originalUrl: mockData.originalUrl,
      shortCode: mockData.shortCode,
      visitsCounter: mockData.visitsCounter,
      createdAt: mockData.createdAt,
      updatedAt: mockData.updatedAt,
    })
  })
})
