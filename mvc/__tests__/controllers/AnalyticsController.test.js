import AnalyticsController from '../../src/controllers/AnalyticsController.js'
import LinkModel from '../../src/models/LinkModel.js'
import AnalyticModel from '../../src/models/AnalyticModel.js'
import AnalyticSerializer from '../../src/serializers/AnalyticSerializer.js'

jest.mock('../../src/models/LinkModel.js', () => ({
  findById: jest.fn(),
}))

jest.mock('../../src/models/AnalyticModel.js', () => ({
  findAnalyticsByLinkId: jest.fn(),
}))

jest.mock('../../src/serializers/AnalyticSerializer.js', () => ({
  serializeMany: jest.fn(),
}))

describe('AnalyticsController', () => {
  let req, res

  beforeEach(() => {
    req = {
      params: { linkId: '123' },
      query: { page: '1' },
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  test('should return analytics data for a valid link', async () => {
    const mockLink = { id: '123', originalUrl: 'https://example.com' }
    const mockAnalytics = [
      {
        id: '1',
        linkId: '123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        visitedAt: new Date(),
      },
    ]
    const serializedAnalytics = [{ id: '1', ip: '192.168.1.1' }]

    LinkModel.findById.mockResolvedValue(mockLink)
    AnalyticModel.findAnalyticsByLinkId.mockResolvedValue(mockAnalytics)
    AnalyticSerializer.serializeMany.mockImplementation(analytics =>
      analytics.map(a => ({
        id: a.id,
        ip: a.ip,
        linkId: a.linkId,
        userAgent: a.userAgent,
        visitedAt: a.visitedAt,
      }))
    )

    await AnalyticsController.index(req, res)

    expect(LinkModel.findById).toHaveBeenCalledWith('123')
    expect(AnalyticModel.findAnalyticsByLinkId).toHaveBeenCalledWith(
      '123',
      10,
      0
    )
  })

  test('should return 404 if link does not exist', async () => {
    LinkModel.findById.mockResolvedValue(null)

    await AnalyticsController.index(req, res)

    expect(LinkModel.findById).toHaveBeenCalledWith('123')
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
  })
})
