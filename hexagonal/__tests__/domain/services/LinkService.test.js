import LinkService from '../../../domain/services/LinkService.js'
import Link from '../../../domain/models/Link.js'
import { InvalidUrlError } from '../../../domain/exceptions/LinkExceptions.js'

jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('abc123'),
}))

describe('LinkService', () => {
  let linkService

  beforeEach(() => {
    linkService = new LinkService()
  })

  describe('validateUrl', () => {
    test('should return true for valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path?query=value',
        'http://localhost:3000',
        'https://subdomain.example.co.uk/path',
      ]

      validUrls.forEach(url => {
        expect(linkService.validateUrl(url)).toBe(true)
      })
    })

    test('should return false for invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'http:/example.com',
        'https://',
        'example.com',
        'ftp://example.com',
      ]

      invalidUrls.forEach(url => {
        expect(linkService.validateUrl(url)).toBe(false)
      })
    })
  })

  describe('createLink', () => {
    test('should create a link with valid URL', () => {
      const originalUrl = 'https://example.com'
      const link = linkService.createLink(originalUrl)

      expect(link).toBeInstanceOf(Link)
      expect(link.originalUrl).toBe(originalUrl)
      expect(link.shortCode).toBe('abc123')
      expect(link.visitsCounter).toBe(0)
      expect(link.id).toBeNull()
      expect(link.createdAt).toBeInstanceOf(Date)
      expect(link.updatedAt).toBeInstanceOf(Date)
    })

    test('should throw InvalidUrlError for invalid URL', () => {
      const invalidUrl = 'not-a-url'

      expect(() => {
        linkService.createLink(invalidUrl)
      }).toThrow(InvalidUrlError)
      expect(() => {
        linkService.createLink(invalidUrl)
      }).toThrow('Invalid URL format')
    })

    test('should use custom code length if provided', () => {
      const { nanoid } = require('nanoid')
      nanoid.mockClear()

      linkService.createLink('https://example.com', 5)
      expect(nanoid).toHaveBeenCalledWith(5)

      linkService.createLink('https://example.com', 10)
      expect(nanoid).toHaveBeenCalledWith(10)
    })
  })
})
