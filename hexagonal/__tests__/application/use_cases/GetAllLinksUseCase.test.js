import GetAllLinksUseCase from '../../../application/use_cases/GetAllLinksUseCase.js'
import Link from '../../../domain/models/Link.js'

describe('GetAllLinksUseCase', () => {
  const mockLinks = [
    new Link(
      'test-id-1',
      'https://example1.com',
      'abc123',
      0,
      new Date(),
      new Date()
    ),
    new Link(
      'test-id-2',
      'https://example2.com',
      'def456',
      0,
      new Date(),
      new Date()
    ),
  ]

  const mockLinkRepository = {
    findAll: jest.fn().mockResolvedValue(mockLinks),
  }

  let getAllLinksUseCase

  beforeEach(() => {
    mockLinkRepository.findAll.mockClear()
    getAllLinksUseCase = new GetAllLinksUseCase(mockLinkRepository)
  })

  test('should get all links successfully', async () => {
    const result = await getAllLinksUseCase.execute()

    expect(mockLinkRepository.findAll).toHaveBeenCalled()
    expect(result).toBe(mockLinks)
    expect(result.length).toBe(2)
  })

  test('should return empty array when no links exist', async () => {
    mockLinkRepository.findAll.mockResolvedValueOnce([])

    const result = await getAllLinksUseCase.execute()

    expect(mockLinkRepository.findAll).toHaveBeenCalled()
    expect(result).toEqual([])
    expect(result.length).toBe(0)
  })

  test('should propagate errors from linkRepository', async () => {
    const error = new Error('Database error')
    mockLinkRepository.findAll.mockRejectedValueOnce(error)

    await expect(getAllLinksUseCase.execute()).rejects.toThrow(error)

    expect(mockLinkRepository.findAll).toHaveBeenCalled()
  })
})
