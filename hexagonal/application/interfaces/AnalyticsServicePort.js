class AnalyticsServicePort {
  async trackVisit(linkId, ip, userAgent) {
    throw new Error('Method not implemented')
  }

  async getAnalytics(linkId, page, limit) {
    throw new Error('Method not implemented')
  }
}

export default AnalyticsServicePort
