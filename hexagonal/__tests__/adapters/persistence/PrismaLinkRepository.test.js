import { PrismaClient } from '@prisma/client'
import PrismaLinkRepository from '../../../adapters/persistence/PrismaLinkRepository.js'
import Link from '../../../domain/models/Link.js'

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    link: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mockPrismaClient) }
})

describe('PrismaLinkRepository', () => {
  let prismaLinkRepository
  let mockPrisma

  beforeEach(() => {
    mockPrisma = new PrismaClient()

    jest.clearAllMocks()

    prismaLinkRepository = new PrismaLinkRepository()
    prismaLinkRepository.prisma = mockPrisma
  })

  describe('create', () => {
    test('should create a link in the database', async () => {
      const linkToCreate = new Link(
        null,
        'https://example.com',
        'abc123',
        0,
        new Date('2023-01-01'),
        new Date('2023-01-01')
      )

      const createdLinkData = {
        id: 'test-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        visitsCounter: 0,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      }

      mockPrisma.link.create.mockResolvedValueOnce(createdLinkData)

      const result = await prismaLinkRepository.create(linkToCreate)

      expect(mockPrisma.link.create).toHaveBeenCalledWith({
        data: {
          originalUrl: linkToCreate.originalUrl,
          shortCode: linkToCreate.shortCode,
          visitsCounter: linkToCreate.visitsCounter,
        },
      })

      expect(result).toBeInstanceOf(Link)
      expect(result.id).toBe(createdLinkData.id)
      expect(result.originalUrl).toBe(createdLinkData.originalUrl)
      expect(result.shortCode).toBe(createdLinkData.shortCode)
      expect(result.visitsCounter).toBe(createdLinkData.visitsCounter)
      expect(result.createdAt).toEqual(createdLinkData.createdAt)
      expect(result.updatedAt).toEqual(createdLinkData.updatedAt)
    })
  })

  describe('findById', () => {
    test('should find a link by id', async () => {
      const id = 'test-id'
      const linkData = {
        id: 'test-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        visitsCounter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      mockPrisma.link.findUnique.mockResolvedValueOnce(linkData)

      const result = await prismaLinkRepository.findById(id)

      expect(mockPrisma.link.findUnique).toHaveBeenCalledWith({
        where: { id },
      })

      expect(result).toBeInstanceOf(Link)
      expect(result.id).toBe(linkData.id)
      expect(result.originalUrl).toBe(linkData.originalUrl)
      expect(result.shortCode).toBe(linkData.shortCode)
      expect(result.visitsCounter).toBe(linkData.visitsCounter)
      expect(result.createdAt).toEqual(linkData.createdAt)
      expect(result.updatedAt).toEqual(linkData.updatedAt)
    })

    test('should return null when link is not found', async () => {
      const id = 'nonexistent'
      mockPrisma.link.findUnique.mockResolvedValueOnce(null)

      const result = await prismaLinkRepository.findById(id)

      expect(mockPrisma.link.findUnique).toHaveBeenCalledWith({
        where: { id },
      })
      expect(result).toBeNull()
    })
  })

  describe('findByShortCode', () => {
    test('should find a link by short code', async () => {
      const shortCode = 'abc123'
      const linkData = {
        id: 'test-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        visitsCounter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      mockPrisma.link.findUnique.mockResolvedValueOnce(linkData)

      const result = await prismaLinkRepository.findByShortCode(shortCode)

      expect(mockPrisma.link.findUnique).toHaveBeenCalledWith({
        where: { shortCode },
      })

      expect(result).toBeInstanceOf(Link)
      expect(result.id).toBe(linkData.id)
      expect(result.originalUrl).toBe(linkData.originalUrl)
      expect(result.shortCode).toBe(linkData.shortCode)
    })

    test('should return null when link is not found', async () => {
      const shortCode = 'nonexistent'
      mockPrisma.link.findUnique.mockResolvedValueOnce(null)

      const result = await prismaLinkRepository.findByShortCode(shortCode)

      expect(mockPrisma.link.findUnique).toHaveBeenCalledWith({
        where: { shortCode },
      })
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    test('should update a link in the database', async () => {
      const linkToUpdate = new Link(
        'test-id',
        'https://updated-example.com',
        'abc123',
        10,
        new Date('2023-01-01'),
        new Date('2023-01-01')
      )

      const updatedLinkData = {
        id: 'test-id',
        originalUrl: 'https://updated-example.com',
        shortCode: 'abc123',
        visitsCounter: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      mockPrisma.link.update.mockResolvedValueOnce(updatedLinkData)

      const result = await prismaLinkRepository.update(linkToUpdate)

      expect(mockPrisma.link.update).toHaveBeenCalledWith({
        where: { id: linkToUpdate.id },
        data: {
          originalUrl: linkToUpdate.originalUrl,
          shortCode: linkToUpdate.shortCode,
          visitsCounter: linkToUpdate.visitsCounter,
          updatedAt: expect.any(Date),
        },
      })

      expect(result).toBeInstanceOf(Link)
      expect(result.id).toBe(updatedLinkData.id)
      expect(result.originalUrl).toBe(updatedLinkData.originalUrl)
      expect(result.shortCode).toBe(updatedLinkData.shortCode)
      expect(result.visitsCounter).toBe(updatedLinkData.visitsCounter)
      expect(result.createdAt).toEqual(updatedLinkData.createdAt)
      expect(result.updatedAt).toEqual(updatedLinkData.updatedAt)
    })
  })

  describe('delete', () => {
    test('should delete a link from the database', async () => {
      const id = 'test-id'
      mockPrisma.link.delete.mockResolvedValueOnce({ id })

      const result = await prismaLinkRepository.delete(id)

      expect(mockPrisma.link.delete).toHaveBeenCalledWith({
        where: { id },
      })
      expect(result).toBe(true)
    })
  })

  describe('findAll', () => {
    test('should return all links ordered by createdAt desc', async () => {
      const linksData = [
        {
          id: 'test-id-1',
          originalUrl: 'https://example1.com',
          shortCode: 'abc123',
          visitsCounter: 5,
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-03'),
        },
        {
          id: 'test-id-2',
          originalUrl: 'https://example2.com',
          shortCode: 'def456',
          visitsCounter: 10,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        },
      ]

      mockPrisma.link.findMany.mockResolvedValueOnce(linksData)

      const results = await prismaLinkRepository.findAll()

      expect(mockPrisma.link.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 15,
      })

      expect(results).toHaveLength(2)
      expect(results[0]).toBeInstanceOf(Link)
      expect(results[1]).toBeInstanceOf(Link)

      expect(results[0].id).toBe(linksData[0].id)
      expect(results[0].originalUrl).toBe(linksData[0].originalUrl)
      expect(results[0].shortCode).toBe(linksData[0].shortCode)
      expect(results[0].visitsCounter).toBe(linksData[0].visitsCounter)
      expect(results[0].createdAt).toEqual(linksData[0].createdAt)
      expect(results[0].updatedAt).toEqual(linksData[0].updatedAt)

      expect(results[1].id).toBe(linksData[1].id)
      expect(results[1].originalUrl).toBe(linksData[1].originalUrl)
      expect(results[1].shortCode).toBe(linksData[1].shortCode)
      expect(results[1].visitsCounter).toBe(linksData[1].visitsCounter)
      expect(results[1].createdAt).toEqual(linksData[1].createdAt)
      expect(results[1].updatedAt).toEqual(linksData[1].updatedAt)
    })

    test('should return an empty array when no links exist', async () => {
      mockPrisma.link.findMany.mockResolvedValueOnce([])

      const results = await prismaLinkRepository.findAll()

      expect(mockPrisma.link.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 15,
      })
      expect(results).toEqual([])
    })
  })
})
