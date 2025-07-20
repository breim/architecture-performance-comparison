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

  const mockAnalyticsService = {
    trackVisit: jest.fn().mockResolvedValue(mockAnalytics),
  }

  let redirectLinkUseCase

  beforeEach(() => {
    mockLinkRepository.findByShortCode.mockClear()
    mockLinkRepository.update.mockClear()
    mockAnalyticsService.trackVisit.mockClear()

    mockLinkRepository.findByShortCode.mockResolvedValue(mockLink)

    redirectLinkUseCase = new RedirectLinkUseCase(
      mockLinkRepository,
      mockAnalyticsService
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

    expect(mockAnalyticsService.trackVisit).toHaveBeenCalledWith(
      mockLink.id,
      ip,
      userAgent
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
    expect(mockAnalyticsService.trackVisit).not.toHaveBeenCalled()
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
    expect(mockAnalyticsService.trackVisit).not.toHaveBeenCalled()
  })

  test('should propagate errors from analytics service', async () => {
    const error = new Error('Analytics service error')
    mockAnalyticsService.trackVisit.mockRejectedValueOnce(error)

    const shortCode = 'abc123'
    const ip = '127.0.0.1'
    const userAgent = 'Mozilla/5.0'

    await expect(
      redirectLinkUseCase.execute(shortCode, ip, userAgent)
    ).rejects.toThrow(error)

    expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(shortCode)
    expect(mockLinkRepository.update).toHaveBeenCalled()
    expect(mockAnalyticsService.trackVisit).toHaveBeenCalled()
  })

  test('should handle redirect without analytics service', async () => {
    const shortCode = 'abc123'
    const ip = '127.0.0.1'
    const userAgent = 'Mozilla/5.0'

    // Create a new instance without analytics service
    const redirectLinkUseCaseWithoutAnalytics = new RedirectLinkUseCase(
      mockLinkRepository,
      null
    )

    const result = await redirectLinkUseCaseWithoutAnalytics.execute(
      shortCode,
      ip,
      userAgent
    )

    expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(shortCode)
    expect(mockLinkRepository.update).toHaveBeenCalled()
    expect(mockAnalyticsService.trackVisit).not.toHaveBeenCalled()
    expect(result).toBe(mockLink.originalUrl)
  })
})
