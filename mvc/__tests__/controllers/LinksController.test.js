import LinksController from '../../src/controllers/LinksController'
import LinkModel from '../../src/models/LinkModel'
import LinkSerializer from '../../src/serializers/LinkSerializer'
import { nanoid } from 'nanoid'

// Create mocks for dependencies
jest.mock('../../src/models/LinkModel')
jest.mock('../../src/serializers/LinkSerializer')
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => '12345678'),
}))

describe('LinksController', () => {
  let req
  let res
  const next = jest.fn()

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
      send: jest.fn(),
    }
    jest.clearAllMocks()
  })

  describe('index', () => {
    it('should return the list of links', async () => {
      const fakeLinks = [{ id: 1, originalUrl: 'http://example.com' }]
      LinkModel.findAll.mockResolvedValue(fakeLinks)
      LinkSerializer.serializeMany.mockReturnValue(fakeLinks)

      await LinksController.index(req, res)

      expect(LinkModel.findAll).toHaveBeenCalled()
      expect(LinkSerializer.serializeMany).toHaveBeenCalledWith(fakeLinks)
      expect(res.json).toHaveBeenCalledWith(fakeLinks)
    })
  })

  describe('create', () => {
    it('should return an error if URL is not provided', async () => {
      req.body = {}

      await LinksController.create(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'URL is required' })
    })

    it('should create a new link when URL is provided', async () => {
      req.body = { url: 'http://example.com' }
      const fakeLink = {
        id: 1,
        originalUrl: 'http://example.com',
        shortCode: '12345678',
      }
      LinkModel.create.mockResolvedValue(fakeLink)
      LinkSerializer.serialize.mockReturnValue(fakeLink)

      await LinksController.create(req, res)

      expect(nanoid).toHaveBeenCalledWith(8)
      expect(LinkModel.create).toHaveBeenCalledWith({
        originalUrl: 'http://example.com',
        shortCode: '12345678',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(fakeLink)
    })
  })

  describe('show', () => {
    it('should return an error if the link is not found', async () => {
      req.params = { id: '1' }
      LinkModel.findById.mockResolvedValue(null)

      await LinksController.show(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    it('should return the link if found', async () => {
      req.params = { id: '1' }
      const fakeLink = { id: '1', originalUrl: 'http://example.com' }
      LinkModel.findById.mockResolvedValue(fakeLink)
      LinkSerializer.serialize.mockReturnValue(fakeLink)

      await LinksController.show(req, res)

      expect(LinkModel.findById).toHaveBeenCalledWith('1')
      expect(LinkSerializer.serialize).toHaveBeenCalledWith(fakeLink)
      expect(res.json).toHaveBeenCalledWith(fakeLink)
    })
  })

  describe('redirect', () => {
    it('should return an error if the short URL is not found', async () => {
      req.params = { shortCode: 'abcd' }
      LinkModel.findByShortCode.mockResolvedValue(null)

      await LinksController.redirect(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Short URL not found' })
    })

    it('should redirect to the original URL if the short URL is found', async () => {
      req.params = { shortCode: 'abcd' }
      req.ip = '127.0.0.1'
      req.useragent = { source: 'Mozilla' }
      const fakeLink = { id: '1', originalUrl: 'http://example.com' }
      LinkModel.findByShortCode.mockResolvedValue(fakeLink)
      LinkModel.trackAndIncrement = jest.fn()

      await LinksController.redirect(req, res)

      expect(LinkModel.trackAndIncrement).toHaveBeenCalledWith(
        fakeLink.id,
        req.ip,
        req.useragent.source
      )
      expect(res.redirect).toHaveBeenCalledWith(fakeLink.originalUrl)
    })
  })

  describe('update', () => {
    it('should return an error if URL is not provided', async () => {
      req.params = { id: '1' }
      req.body = {}

      await LinksController.update(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'URL is required' })
    })

    it('should return an error if the link is not found', async () => {
      req.params = { id: '1' }
      req.body = { url: 'http://updated.com' }
      LinkModel.findById.mockResolvedValue(null)

      await LinksController.update(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    it('should update the link if found', async () => {
      req.params = { id: 'xpto' }
      req.body = { url: 'http://updated.com' }
      const existingLink = {
        id: 'xpto',
        originalUrl: 'http://example.com',
      }
      const updatedLink = { id: 'xpto', originalUrl: 'http://updated.com' }
      LinkModel.findById.mockResolvedValue(existingLink)
      LinkModel.update.mockResolvedValue(updatedLink)
      LinkSerializer.serialize.mockReturnValue(updatedLink)

      await LinksController.update(req, res, next)

      expect(LinkModel.findById).toHaveBeenCalledWith('xpto')
      expect(LinkModel.update).toHaveBeenCalledWith('xpto', {
        originalUrl: 'http://updated.com',
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should return an error if the link is not found', async () => {
      req.params = { id: '1' }
      LinkModel.findById.mockResolvedValue(null)

      await LinksController.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Link not found' })
    })

    it('should delete the link if found', async () => {
      req.params = { id: '1' }
      const existingLink = { id: '1', originalUrl: 'http://example.com' }
      LinkModel.findById.mockResolvedValue(existingLink)
      LinkModel.delete.mockResolvedValue()

      await LinksController.delete(req, res, next)

      expect(LinkModel.delete).toHaveBeenCalledWith('1')
    })
  })
})
