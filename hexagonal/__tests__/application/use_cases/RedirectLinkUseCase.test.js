import RedirectLinkUseCase from '../../../application/use_cases/RedirectLinkUseCase.js'
import Link from '../../../domain/models/Link.js'
import Analytics from '../../../domain/models/Analytics.js'
import { LinkNotFoundError } from '../../../domain/exceptions/LinkExceptions.js'

describe('RedirectLinkUseCase', () => {
  const mockLink = new Link(
    'test-id',
    'https://example.com',
    'abc123',
    5,
    new Date(),
    new Date()
  )

  const mockAnalytics = new Analytics(
    'analytics-id',
    'test-id',
    '127.0.0.1',
    'Mozilla/5.0',
    new Date()
  )

  const mockLinkRepository = {
    findByShortCode: jest.fn(),
    update: jest.fn().mockResolvedValue(mockLink),
  }

  const mockAnalyticsRepository = {
    create: jest.fn().mockResolvedValue(mockAnalytics),
  }

  let redirectLinkUseCase

  beforeEach(() => {
    mockLinkRepository.findByShortCode.mockClear()
    mockLinkRepository.update.mockClear()
    mockAnalyticsRepository.create.mockClear()

    mockLinkRepository.findByShortCode.mockResolvedValue(mockLink)

    redirectLinkUseCase = new RedirectLinkUseCase(
      mockLinkRepository,
      mockAnalyticsRepository
    )
  })

  test('should redirect a link successfully', async () => {
    const shortCode = 'abc123'
    const ip = '127.0.0.1'
    const userAgent = 'Mozilla/5.0'

    const linkBeforeRedirect = new Link(
      'test-id',
      'https://example.com',
      'abc123',
      5,
      new Date(),
      new Date()
    )
    mockLinkRepository.findByShortCode.mockResolvedValueOnce(linkBeforeRedirect)

    const result = await redirectLinkUseCase.execute(shortCode, ip, userAgent)

    expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(shortCode)
    expect(mockLinkRepository.update).toHaveBeenCalled()

    const updatedLink = mockLinkRepository.update.mock.calls[0][0]
    expect(updatedLink.visitsCounter).toBe(6)

    expect(mockAnalyticsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        linkId: mockLink.id,
        ip,
        userAgent,
      })
    )

    expect(result).toBe(mockLink.originalUrl)
  })

  test('should throw LinkNotFoundError when link is not found', async () => {
    mockLinkRepository.findByShortCode.mockResolvedValueOnce(null)

    const shortCode = 'nonexistent'
    const ip = '127.0.0.1'
    const userAgent = 'Mozilla/5.0'

    await expect(
      redirectLinkUseCase.execute(shortCode, ip, userAgent)
    ).rejects.toThrow(LinkNotFoundError)

    expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(shortCode)
    expect(mockLinkRepository.update).not.toHaveBeenCalled()
    expect(mockAnalyticsRepository.create).not.toHaveBeenCalled()
  })

  test('should propagate errors from linkRepository.update', async () => {
    const error = new Error('Database error')
    mockLinkRepository.update.mockRejectedValueOnce(error)

    const shortCode = 'abc123'
    const ip = '127.0.0.1'
    const userAgent = 'Mozilla/5.0'

    await expect(
      redirectLinkUseCase.execute(shortCode, ip, userAgent)
    ).rejects.toThrow(error)

    expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(shortCode)
    expect(mockLinkRepository.update).toHaveBeenCalled()
    expect(mockAnalyticsRepository.create).not.toHaveBeenCalled()
  })

  test('should propagate errors from analyticsRepository.create', async () => {
    const error = new Error('Analytics database error')
    mockAnalyticsRepository.create.mockRejectedValueOnce(error)

    const shortCode = 'abc123'
    const ip = '127.0.0.1'
    const userAgent = 'Mozilla/5.0'

    await expect(
      redirectLinkUseCase.execute(shortCode, ip, userAgent)
    ).rejects.toThrow(error)

    expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(shortCode)
    expect(mockLinkRepository.update).toHaveBeenCalled()
    expect(mockAnalyticsRepository.create).toHaveBeenCalled()
  })
})
