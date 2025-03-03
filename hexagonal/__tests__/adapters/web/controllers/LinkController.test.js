import LinkController from '../../../../adapters/web/controllers/LinkController.js'
import Link from '../../../../domain/models/Link.js'
import {
  InvalidUrlError,
  LinkNotFoundError,
} from '../../../../domain/exceptions/LinkExceptions.js'

describe('LinkController', () => {
  const mockLink = new Link(
    'test-id',
    'https://example.com',
    'abc123',
    0,
    new Date(),
    new Date()
  )

  const mockLinks = [
    mockLink,
    new Link(
      'test-id-2',
      'https://example.org',
      'def456',
      5,
      new Date(),
      new Date()
    ),
  ]

  const mockAnalytics = {
    link: mockLink.toJSON(),
    analytics: {
      visits: 10,
      details: [],
      summary: {
        totalVisits: 10,
        uniqueVisitors: 5,
        visitsByDate: [],
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 10,
        totalPages: 1,
      },
    },
  }

  const mockCreateLinkUseCase = {
    execute: jest.fn().mockResolvedValue(mockLink),
  }

  const mockRedirectLinkUseCase = {
    execute: jest.fn().mockResolvedValue('https://example.com'),
  }

  const mockGetLinkAnalyticsUseCase = {
    execute: jest.fn().mockResolvedValue(mockAnalytics),
  }

  const mockGetAllLinksUseCase = {
    execute: jest.fn().mockResolvedValue(mockLinks),
  }

  const mockGetLinkByIdUseCase = {
    execute: jest.fn().mockResolvedValue(mockLink),
  }

  const mockUpdateLinkUseCase = {
    execute: jest.fn().mockResolvedValue(mockLink),
  }

  const mockDeleteLinkUseCase = {
    execute: jest.fn().mockResolvedValue(true),
  }

  const mockRequest = () => {
    const req = {}
    req.body = {}
    req.params = {}
    req.query = {}
    req.headers = {}
    req.ip = '127.0.0.1'
    req.useragent = { source: 'Mozilla/5.0' }
    req.protocol = 'http'
    req.get = jest.fn().mockImplementation(header => {
      if (header === 'host') return 'localhost:3000'
      if (header === 'User-Agent') return 'Mozilla/5.0'
      return null
    })
    return req
  }

  const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.redirect = jest.fn().mockReturnValue(res)
    return res
  }

  let linkController
  let req
  let res

  beforeEach(() => {
    mockCreateLinkUseCase.execute.mockClear()
    mockRedirectLinkUseCase.execute.mockClear()
    mockGetLinkAnalyticsUseCase.execute.mockClear()
    mockGetAllLinksUseCase.execute.mockClear()
    mockGetLinkByIdUseCase.execute.mockClear()
    mockUpdateLinkUseCase.execute.mockClear()
    mockDeleteLinkUseCase.execute.mockClear()

    mockCreateLinkUseCase.execute.mockResolvedValue(mockLink)
    mockRedirectLinkUseCase.execute.mockResolvedValue('https://example.com')
    mockGetLinkAnalyticsUseCase.execute.mockResolvedValue(mockAnalytics)
    mockGetAllLinksUseCase.execute.mockResolvedValue(mockLinks)
    mockGetLinkByIdUseCase.execute.mockResolvedValue(mockLink)
    mockUpdateLinkUseCase.execute.mockResolvedValue(mockLink)
    mockDeleteLinkUseCase.execute.mockResolvedValue(true)

    linkController = new LinkController(
      mockCreateLinkUseCase,
      mockRedirectLinkUseCase,
      mockGetLinkAnalyticsUseCase,
      mockGetAllLinksUseCase,
      mockGetLinkByIdUseCase,
      mockUpdateLinkUseCase,
      mockDeleteLinkUseCase
    )

    req = mockRequest()
    res = mockResponse()
  })

  describe('index', () => {
    test('should return all links', async () => {
      await linkController.index(req, res)

      expect(mockGetAllLinksUseCase.execute).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        mockLinks.map(link => {
          const linkJson = link.toJSON()
          linkJson.shortUrl = `http://localhost:3000/${link.shortCode}`
          return linkJson
        })
      )
    })

    test('should handle errors', async () => {
      const error = new Error('Database error')
      mockGetAllLinksUseCase.execute.mockRejectedValueOnce(error)

      await linkController.index(req, res)

      expect(mockGetAllLinksUseCase.execute).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('create', () => {
    test('should create a link', async () => {
      req.body.originalUrl = 'https://example.com'

      await linkController.create(req, res)

      expect(mockCreateLinkUseCase.execute).toHaveBeenCalledWith(
        'https://example.com'
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        id: mockLink.id,
        originalUrl: mockLink.originalUrl,
        shortCode: mockLink.shortCode,
        shortUrl: `http://localhost:3000/${mockLink.shortCode}`,
        visitsCounter: mockLink.visitsCounter,
        createdAt: mockLink.createdAt,
      })
    })

    test('should return 400 when originalUrl is missing', async () => {
      await linkController.create(req, res)

      expect(mockCreateLinkUseCase.execute).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Original URL is required',
      })
    })

    test('should handle InvalidUrlError', async () => {
      req.body.originalUrl = 'invalid-url'
      mockCreateLinkUseCase.execute.mockRejectedValueOnce(
        new InvalidUrlError('Invalid URL format')
      )

      await linkController.create(req, res)

      expect(mockCreateLinkUseCase.execute).toHaveBeenCalledWith('invalid-url')
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid URL format' })
    })

    test('should handle other errors', async () => {
      req.body.originalUrl = 'https://example.com'
      mockCreateLinkUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      )

      await linkController.create(req, res)

      expect(mockCreateLinkUseCase.execute).toHaveBeenCalledWith(
        'https://example.com'
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('show', () => {
    test('should return a link by id', async () => {
      req.params.id = 'test-id'

      await linkController.show(req, res)

      expect(mockGetLinkByIdUseCase.execute).toHaveBeenCalledWith('test-id')
      expect(res.status).toHaveBeenCalledWith(200)

      const expectedResponse = {
        ...mockLink.toJSON(),
        shortUrl: `http://localhost:3000/${mockLink.shortCode}`,
      }
      expect(res.json).toHaveBeenCalledWith(expectedResponse)
    })

    test('should handle LinkNotFoundError', async () => {
      req.params.id = 'nonexistent'
      mockGetLinkByIdUseCase.execute.mockRejectedValueOnce(
        new LinkNotFoundError('Link not found')
      )

      await linkController.show(req, res)

      expect(mockGetLinkByIdUseCase.execute).toHaveBeenCalledWith('nonexistent')
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    test('should handle other errors', async () => {
      req.params.id = 'test-id'
      mockGetLinkByIdUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      )

      await linkController.show(req, res)

      expect(mockGetLinkByIdUseCase.execute).toHaveBeenCalledWith('test-id')
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('update', () => {
    test('should update a link', async () => {
      req.params.id = 'test-id'
      req.body.originalUrl = 'https://updated-example.com'

      await linkController.update(req, res)

      expect(mockUpdateLinkUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        'https://updated-example.com'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        ...mockLink.toJSON(),
        shortUrl: `http://localhost:3000/${mockLink.shortCode}`,
      })
    })

    test('should return 400 when originalUrl is missing', async () => {
      req.params.id = 'test-id'

      await linkController.update(req, res)

      expect(mockUpdateLinkUseCase.execute).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Original URL is required',
      })
    })

    test('should handle LinkNotFoundError', async () => {
      req.params.id = 'nonexistent'
      req.body.originalUrl = 'https://example.com'
      mockUpdateLinkUseCase.execute.mockRejectedValueOnce(
        new LinkNotFoundError('Link not found')
      )

      await linkController.update(req, res)

      expect(mockUpdateLinkUseCase.execute).toHaveBeenCalledWith(
        'nonexistent',
        'https://example.com'
      )
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    test('should handle InvalidUrlError', async () => {
      req.params.id = 'test-id'
      req.body.originalUrl = 'invalid-url'
      mockUpdateLinkUseCase.execute.mockRejectedValueOnce(
        new InvalidUrlError('Invalid URL format')
      )

      await linkController.update(req, res)

      expect(mockUpdateLinkUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        'invalid-url'
      )
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid URL format' })
    })

    test('should handle other errors', async () => {
      req.params.id = 'test-id'
      req.body.originalUrl = 'https://example.com'
      mockUpdateLinkUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      )

      await linkController.update(req, res)

      expect(mockUpdateLinkUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        'https://example.com'
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('delete', () => {
    test('should delete a link', async () => {
      req.params.id = 'test-id'

      await linkController.delete(req, res)

      expect(mockDeleteLinkUseCase.execute).toHaveBeenCalledWith('test-id')
      expect(res.status).toHaveBeenCalledWith(204)
    })

    test('should handle LinkNotFoundError', async () => {
      req.params.id = 'nonexistent'
      mockDeleteLinkUseCase.execute.mockRejectedValueOnce(
        new LinkNotFoundError('Link not found')
      )

      await linkController.delete(req, res)

      expect(mockDeleteLinkUseCase.execute).toHaveBeenCalledWith('nonexistent')
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    test('should handle other errors', async () => {
      req.params.id = 'test-id'
      mockDeleteLinkUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      )

      await linkController.delete(req, res)

      expect(mockDeleteLinkUseCase.execute).toHaveBeenCalledWith('test-id')
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('redirectLink', () => {
    test('should redirect to the original URL', async () => {
      req.params.shortCode = 'abc123'
      req.clientIp = '127.0.0.1'
      req.useragent = { source: 'Mozilla/5.0' }

      await linkController.redirectLink(req, res)

      expect(mockRedirectLinkUseCase.execute).toHaveBeenCalledWith(
        'abc123',
        '127.0.0.1',
        'Mozilla/5.0'
      )
      expect(res.redirect).toHaveBeenCalledWith('https://example.com')
    })

    test('should use socket.remoteAddress when clientIp is not available', async () => {
      req.params.shortCode = 'abc123'
      req.clientIp = null
      req.socket = { remoteAddress: '192.168.1.1' }
      req.useragent = { source: 'Mozilla/5.0' }

      await linkController.redirectLink(req, res)

      expect(mockRedirectLinkUseCase.execute).toHaveBeenCalledWith(
        'abc123',
        '192.168.1.1',
        'Mozilla/5.0'
      )
      expect(res.redirect).toHaveBeenCalledWith('https://example.com')
    })

    test('should use req.get("User-Agent") when useragent is not available', async () => {
      req.params.shortCode = 'abc123'
      req.clientIp = '127.0.0.1'
      req.useragent = null
      req.get.mockImplementation(header => {
        if (header === 'User-Agent') return 'Alternative User Agent'
        return null
      })

      await linkController.redirectLink(req, res)

      expect(mockRedirectLinkUseCase.execute).toHaveBeenCalledWith(
        'abc123',
        '127.0.0.1',
        'Alternative User Agent'
      )
      expect(res.redirect).toHaveBeenCalledWith('https://example.com')
    })

    test('should handle LinkNotFoundError', async () => {
      req.params.shortCode = 'nonexistent'
      req.clientIp = '127.0.0.1'
      req.useragent = { source: 'Mozilla/5.0' }

      mockRedirectLinkUseCase.execute.mockRejectedValueOnce(
        new LinkNotFoundError('Link not found')
      )

      await linkController.redirectLink(req, res)

      expect(mockRedirectLinkUseCase.execute).toHaveBeenCalledWith(
        'nonexistent',
        '127.0.0.1',
        'Mozilla/5.0'
      )
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    test('should handle other errors', async () => {
      req.params.shortCode = 'abc123'
      req.clientIp = '127.0.0.1'
      req.useragent = { source: 'Mozilla/5.0' }

      mockRedirectLinkUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      )

      await linkController.redirectLink(req, res)

      expect(mockRedirectLinkUseCase.execute).toHaveBeenCalledWith(
        'abc123',
        '127.0.0.1',
        'Mozilla/5.0'
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('getAnalytics', () => {
    test('should return analytics for a link', async () => {
      req.params.id = 'test-id'
      req.query = { page: '2', limit: '20' }

      await linkController.getAnalytics(req, res)

      expect(mockGetLinkAnalyticsUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        2,
        20
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockAnalytics)
    })

    test('should use default pagination values when not provided', async () => {
      req.params.id = 'test-id'
      req.query = {}

      await linkController.getAnalytics(req, res)

      expect(mockGetLinkAnalyticsUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        1,
        10
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockAnalytics)
    })

    test('should handle LinkNotFoundError', async () => {
      req.params.id = 'nonexistent'
      req.query = { page: '1', limit: '10' }

      mockGetLinkAnalyticsUseCase.execute.mockRejectedValueOnce(
        new LinkNotFoundError('Link not found')
      )

      await linkController.getAnalytics(req, res)

      expect(mockGetLinkAnalyticsUseCase.execute).toHaveBeenCalledWith(
        'nonexistent',
        1,
        10
      )
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    test('should handle other errors', async () => {
      req.params.id = 'test-id'
      req.query = { page: '1', limit: '10' }

      mockGetLinkAnalyticsUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      )

      await linkController.getAnalytics(req, res)

      expect(mockGetLinkAnalyticsUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        1,
        10
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })
})
