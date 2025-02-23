import LinkModel from '../../src/models/LinkModel'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

beforeAll(async () => {})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('LinkModel', () => {
  let createdLink

  test('should create a link', async () => {
    const data = {
      originalUrl: 'https://example.com',
      shortCode: 'ex123',
    }

    createdLink = await LinkModel.create(data)
    expect(createdLink).toHaveProperty('id')
    expect(createdLink.originalUrl).toBe(data.originalUrl)
    expect(createdLink.shortCode).toBe(data.shortCode)
  })

  test('should list all links', async () => {
    const links = await LinkModel.findAll()
    expect(Array.isArray(links)).toBe(true)

    const found = links.find(link => link.id === createdLink.id)
    expect(found).toBeTruthy()
  })

  test('should find a link by shortCode', async () => {
    const uniqueShortCode = `test-${Date.now()}`
    const data = {
      originalUrl: 'https://example.com',
      shortCode: uniqueShortCode,
    }

    await LinkModel.create(data)

    const foundLink = await LinkModel.findByShortCode(uniqueShortCode)
    expect(foundLink).toHaveProperty('shortCode', uniqueShortCode)
    expect(foundLink).toHaveProperty('originalUrl', data.originalUrl)
    expect(foundLink.analytics).toBeDefined()
  })

  test('should return null if shortCode does not exist', async () => {
    const link = await LinkModel.findByShortCode('nonexistent-shortCode')
    expect(link).toBeNull()
  })

  test('should update a link', async () => {
    const newUrl = 'https://newexample.com'
    const updatedLink = await LinkModel.update(createdLink.id, {
      originalUrl: newUrl,
    })
    expect(updatedLink.originalUrl).toBe(newUrl)
  })

  test('should delete a link', async () => {
    const deletedLink = await LinkModel.delete(createdLink.id)
    expect(deletedLink.id).toBe(createdLink.id)
    const foundLink = await LinkModel.findById(createdLink.id)
    expect(foundLink).toBeNull()
  })

  test('should throw an error if originalUrl is not provided', async () => {
    await expect(LinkModel.create({ shortCode: 'test' })).rejects.toThrow(
      'originalUrl is required'
    )
  })

  test('should track and increment visits', async () => {
    const uniqueShortCode = `track-${Date.now()}`
    const data = {
      originalUrl: 'https://example.com/track',
      shortCode: uniqueShortCode,
    }
    const link = await LinkModel.create(data)

    const before = link.visitsCounter || 0

    await LinkModel.trackAndIncrement(link.id, '127.0.0.1', 'TestAgent')

    const updatedLink = await LinkModel.findById(link.id)
    expect(updatedLink.visitsCounter).toBe(before + 1)
    expect(updatedLink.analytics.length).toBeGreaterThan(0)
  })
})
