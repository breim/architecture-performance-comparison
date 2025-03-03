import DeleteLinkUseCase from '../../../application/use_cases/DeleteLinkUseCase.js'
import Link from '../../../domain/models/Link.js'
import { LinkNotFoundError } from '../../../domain/exceptions/LinkExceptions.js'

describe('DeleteLinkUseCase', () => {
  const mockLink = new Link(
    'test-id',
    'https://example.com',
    'abc123',
    0,
    new Date(),
    new Date()
  )

  const mockLinkRepository = {
    findById: jest.fn().mockResolvedValue(mockLink),
    delete: jest.fn().mockResolvedValue(true),
  }

  let deleteLinkUseCase

  beforeEach(() => {
    mockLinkRepository.findById.mockClear()
    mockLinkRepository.delete.mockClear()
    deleteLinkUseCase = new DeleteLinkUseCase(mockLinkRepository)
  })

  test('should delete a link successfully', async () => {
    const id = 'test-id'

    const result = await deleteLinkUseCase.execute(id)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkRepository.delete).toHaveBeenCalledWith(id)
    expect(result).toBe(true)
  })

  test('should throw LinkNotFoundError when link does not exist', async () => {
    mockLinkRepository.findById.mockResolvedValueOnce(null)

    const id = 'non-existent-id'

    await expect(deleteLinkUseCase.execute(id)).rejects.toThrow(
      new LinkNotFoundError(`Link with id ${id} not found`)
    )

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkRepository.delete).not.toHaveBeenCalled()
  })

  test('should propagate errors from linkRepository.findById', async () => {
    const error = new Error('Database error')
    mockLinkRepository.findById.mockRejectedValueOnce(error)

    const id = 'test-id'

    await expect(deleteLinkUseCase.execute(id)).rejects.toThrow(error)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkRepository.delete).not.toHaveBeenCalled()
  })

  test('should propagate errors from linkRepository.delete', async () => {
    const error = new Error('Database error')
    mockLinkRepository.delete.mockRejectedValueOnce(error)

    const id = 'test-id'

    await expect(deleteLinkUseCase.execute(id)).rejects.toThrow(error)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(mockLinkRepository.delete).toHaveBeenCalledWith(id)
  })
})
