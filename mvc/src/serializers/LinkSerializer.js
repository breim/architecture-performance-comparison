import AnalyticSerializer from './AnalyticSerializer.js'

class LinkSerializer {
  static serialize(link) {
    return {
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
      createdAt: link.createdAt,
      visitsCounter: link.visitsCounter,
      analytics: AnalyticSerializer.serializeMany(link.analytics || []),
    }
  }

  static serializeMany(links) {
    return links.map(link => this.serialize(link))
  }
}

export default LinkSerializer
