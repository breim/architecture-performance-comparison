import CreateLinkUseCase from '../../../application/use_cases/CreateLinkUseCase.js'
import Link from '../../../domain/models/Link.js'
import { InvalidUrlError } from '../../../domain/exceptions/LinkExceptions.js'

describe('CreateLinkUseCase', () => {
  const mockLink = new Link(
    'test-id',
    'https://example.com',
    'abc123',
    0,
    new Date(),
    new Date()
  )

  const mockLinkService = {
    createLink: jest.fn().mockReturnValue(mockLink),
  }

  const mockLinkRepository = {
    create: jest.fn().mockResolvedValue(mockLink),
  }

  let createLinkUseCase

  beforeEach(() => {
    mockLinkService.createLink.mockClear()
    mockLinkRepository.create.mockClear()

    createLinkUseCase = new CreateLinkUseCase(
      mockLinkService,
      mockLinkRepository
    )
  })

  test('should create a link successfully', async () => {
    const originalUrl = 'https://example.com'
    const result = await createLinkUseCase.execute(originalUrl)

    expect(mockLinkService.createLink).toHaveBeenCalledWith(originalUrl)

    expect(mockLinkRepository.create).toHaveBeenCalledWith(mockLink)

    expect(result).toBe(mockLink)
  })

  test('should propagate errors from linkService', async () => {
    const error = new InvalidUrlError('Invalid URL format')
    mockLinkService.createLink.mockImplementationOnce(() => {
      throw error
    })

    const originalUrl = 'invalid-url'

    await expect(createLinkUseCase.execute(originalUrl)).rejects.toThrow(error)
    expect(mockLinkService.createLink).toHaveBeenCalledWith(originalUrl)
    expect(mockLinkRepository.create).not.toHaveBeenCalled()
  })

  test('should propagate errors from linkRepository', async () => {
    const error = new Error('Database error')
    mockLinkRepository.create.mockRejectedValueOnce(error)

    const originalUrl = 'https://example.com'

    await expect(createLinkUseCase.execute(originalUrl)).rejects.toThrow(error)
    expect(mockLinkService.createLink).toHaveBeenCalledWith(originalUrl)
    expect(mockLinkRepository.create).toHaveBeenCalledWith(mockLink)
  })
})
