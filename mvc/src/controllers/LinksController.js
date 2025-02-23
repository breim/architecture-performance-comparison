import { nanoid } from 'nanoid'
import { handleAsyncErrors } from '../utils/errorHandler.js'
import LinkModel from '../models/LinkModel.js'
import LinkSerializer from '../serializers/LinkSerializer.js'

class LinksController {
  static index = handleAsyncErrors(async (req, res) => {
    const links = await LinkModel.findAll()
    res.json(LinkSerializer.serializeMany(links))
  })

  static create = handleAsyncErrors(async (req, res) => {
    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const shortCode = nanoid(8)
    const link = await LinkModel.create({
      originalUrl: url,
      shortCode,
    })

    res.status(201).json(LinkSerializer.serialize(link))
  })

  static show = handleAsyncErrors(async (req, res) => {
    const { id } = req.params

    const link = await LinkModel.findById(id)
    if (!link) {
      return res.status(404).json({ error: 'Link not found' })
    }

    res.json(LinkSerializer.serialize(link))
  })

  static redirect = handleAsyncErrors(async (req, res) => {
    const { shortCode } = req.params
    const link = await LinkModel.findByShortCode(shortCode)

    if (!link) {
      return res.status(404).json({ error: 'Short URL not found' })
    }

    LinkModel.trackAndIncrement(link.id, req.ip, req.useragent.source)

    res.redirect(link.originalUrl)
  })

  static update = handleAsyncErrors(async (req, res) => {
    const { id } = req.params

    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const existingLink = await LinkModel.findById(id)
    if (!existingLink) {
      return res.status(404).json({ error: 'Link not found' })
    }

    const link = await LinkModel.update(id, { originalUrl: url })

    res.json(LinkSerializer.serialize(link))
  })

  static delete = handleAsyncErrors(async (req, res) => {
    const { id } = req.params
    const existingLink = await LinkModel.findById(id)

    if (!existingLink) {
      return res.status(404).json({ error: 'Link not found' })
    }

    await LinkModel.delete(id)

    res.status(204).send()
  })
}

export default LinksController
