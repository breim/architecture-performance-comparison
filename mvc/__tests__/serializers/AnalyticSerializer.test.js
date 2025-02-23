import AnalyticSerializer from '../../src/serializers/AnalyticSerializer.js'

describe('AnalyticSerializer', () => {
  const sampleAnalytic = {
    id: '1',
    linkId: '123',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    visitedAt: new Date('2024-02-23T12:00:00Z'),
  }

  test('should correctly serialize a single analytic entry', () => {
    const serialized = AnalyticSerializer.serialize(sampleAnalytic)

    expect(serialized).toEqual({
      id: '1',
      linkId: '123',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      visitedAt: new Date('2024-02-23T12:00:00Z'),
    })
  })

  test('should correctly serialize multiple analytic entries', () => {
    const analytics = [
      sampleAnalytic,
      { ...sampleAnalytic, id: '2', ip: '10.0.0.1' },
    ]
    const serialized = AnalyticSerializer.serializeMany(analytics)

    expect(serialized).toHaveLength(2)
    expect(serialized[0].id).toBe('1')
    expect(serialized[1].id).toBe('2')
    expect(serialized[1].ip).toBe('10.0.0.1')
  })

  test('should handle an empty array correctly', () => {
    const serialized = AnalyticSerializer.serializeMany([])

    expect(serialized).toEqual([])
  })
})
