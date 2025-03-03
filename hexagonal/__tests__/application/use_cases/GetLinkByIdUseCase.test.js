import GetLinkByIdUseCase from '../../../application/use_cases/GetLinkByIdUseCase.js'
import Link from '../../../domain/models/Link.js'
import { LinkNotFoundError } from '../../../domain/exceptions/LinkExceptions.js'

describe('GetLinkByIdUseCase', () => {
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
  }

  let getLinkByIdUseCase

  beforeEach(() => {
    mockLinkRepository.findById.mockClear()
    getLinkByIdUseCase = new GetLinkByIdUseCase(mockLinkRepository)
  })

  test('should get a link by id successfully', async () => {
    const id = 'test-id'

    const result = await getLinkByIdUseCase.execute(id)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
    expect(result).toBe(mockLink)
  })

  test('should throw LinkNotFoundError when link does not exist', async () => {
    mockLinkRepository.findById.mockResolvedValueOnce(null)

    const id = 'non-existent-id'

    await expect(getLinkByIdUseCase.execute(id)).rejects.toThrow(
      new LinkNotFoundError(`Link with id ${id} not found`)
    )

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
  })

  test('should propagate errors from linkRepository', async () => {
    const error = new Error('Database error')
    mockLinkRepository.findById.mockRejectedValueOnce(error)

    const id = 'test-id'

    await expect(getLinkByIdUseCase.execute(id)).rejects.toThrow(error)

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(id)
  })
})
