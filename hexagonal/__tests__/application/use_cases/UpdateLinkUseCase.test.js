import UpdateLinkUseCase from '../../../application/use_cases/UpdateLinkUseCase.js'
import Link from '../../../domain/models/Link.js'
import {
  InvalidUrlError,
  LinkNotFoundError,
} from '../../../domain/exceptions/LinkExceptions.js'

describe('UpdateLinkUseCase', () => {
  const mockLink = new Link(
    'test-id',
    'https://example.com',
    'abc123',
    0,
    new Date(),
    new Date()
  )

  const updatedMockLink = new Link(
    'test-id',
    'https://updated-example.com',
    'abc123',
    0,
    new Date(),
    new Date()
  )

  const mockLinkService = {
    validateUrl: jest.fn().mockReturnValue(true),
  }

  const mockLinkRepository = {
    findById: jest.fn().mockResolvedValue(mockLink),
    update: jest.fn().mockResolvedValue(updatedMockLink),
  }

  let updateLinkUseCase

  beforeEach(() => {
    mockLinkService.validateUrl.mockClear()
    mockLinkRepository.findById.mockClear()
    mockLinkRepository.update.mockClear()

    mockLink.originalUrl = 'https://example.com'

    updateLinkUseCase = new UpdateLinkUseCase(
      mockLinkService,
      mockLinkRepository
    )
  })

  test('should update a link successfully', async () => {
    const id = 'test-id'
    const newUrl = 'https://updated-example.com'

    const result = await updateLinkUseCase.execute(id, newUrl)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkService.validateUrl).toHaveBeenCalledWith(newUrl)

    expect(mockLink.originalUrl).toBe(newUrl)

    expect(mockLinkRepository.update).toHaveBeenCalledWith(mockLink)

    expect(result).toBe(updatedMockLink)
  })

  test('should throw error when original URL is not provided', async () => {
    const id = 'test-id'
    const newUrl = null

    await expect(updateLinkUseCase.execute(id, newUrl)).rejects.toThrow(
      'Original URL is required'
    )

    expect(mockLinkRepository.findById).not.toHaveBeenCalled()
    expect(mockLinkService.validateUrl).not.toHaveBeenCalled()
    expect(mockLinkRepository.update).not.toHaveBeenCalled()
  })

  test('should throw LinkNotFoundError when link does not exist', async () => {
    mockLinkRepository.findById.mockResolvedValueOnce(null)

    const id = 'non-existent-id'
    const newUrl = 'https://example.com'

    await expect(updateLinkUseCase.execute(id, newUrl)).rejects.toThrow(
      new LinkNotFoundError(`Link with id ${id} not found`)
    )

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkService.validateUrl).not.toHaveBeenCalled()
    expect(mockLinkRepository.update).not.toHaveBeenCalled()
  })

  test('should throw InvalidUrlError when URL is invalid', async () => {
    mockLinkService.validateUrl.mockReturnValueOnce(false)

    const id = 'test-id'
    const invalidUrl = 'invalid-url'

    await expect(updateLinkUseCase.execute(id, invalidUrl)).rejects.toThrow(
      new InvalidUrlError('Invalid URL format')
    )

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkService.validateUrl).toHaveBeenCalledWith(invalidUrl)
    expect(mockLinkRepository.update).not.toHaveBeenCalled()
  })

  test('should propagate errors from linkRepository.update', async () => {
    const error = new Error('Database error')
    mockLinkRepository.update.mockRejectedValueOnce(error)

    const id = 'test-id'
    const newUrl = 'https://updated-example.com'

    await expect(updateLinkUseCase.execute(id, newUrl)).rejects.toThrow(error)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkService.validateUrl).toHaveBeenCalledWith(newUrl)
    expect(mockLinkRepository.update).toHaveBeenCalledWith(mockLink)
  })
})
