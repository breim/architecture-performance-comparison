import LinkSerializer from '../../src/serializers/LinkSerializer.js'
import AnalyticSerializer from '../../src/serializers/AnalyticSerializer.js'

jest.mock('../../src/serializers/AnalyticSerializer.js', () => ({
  serializeMany: jest.fn(() => []),
}))

describe('LinkSerializer', () => {
  const BASE_URL = 'https://short.ly'
  process.env.BASE_URL = BASE_URL

  const sampleLink = {
    id: '123',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    visitsCounter: 5,
    analytics: [{ country: 'US', visits: 3 }],
  }

  test('should correctly serialize a single link', () => {
    const serialized = LinkSerializer.serialize(sampleLink)

    expect(serialized).toEqual({
      id: '123',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      shortUrl: `${BASE_URL}/abc123`,
      createdAt: new Date('2024-01-01T12:00:00Z'),
      visitsCounter: 5,
      analytics: [],
    })

    expect(AnalyticSerializer.serializeMany).toHaveBeenCalledWith(
      sampleLink.analytics
    )
  })

  test('should correctly serialize multiple links', () => {
    const links = [
      sampleLink,
      { ...sampleLink, id: '456', shortCode: 'xyz789' },
    ]
    const serialized = LinkSerializer.serializeMany(links)

    expect(serialized).toHaveLength(2)
    expect(serialized[0].id).toBe('123')
    expect(serialized[1].id).toBe('456')
  })

  test('should handle empty analytics array', () => {
    const linkWithoutAnalytics = { ...sampleLink, analytics: undefined }
    const serialized = LinkSerializer.serialize(linkWithoutAnalytics)

    expect(serialized.analytics).toEqual([])
    expect(AnalyticSerializer.serializeMany).toHaveBeenCalledWith([])
  })
})
