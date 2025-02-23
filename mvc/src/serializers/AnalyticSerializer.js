class AnalyticSerializer {
  static serialize(analytic) {
    return {
      id: analytic.id,
      linkId: analytic.linkId,
      ip: analytic.ip,
      userAgent: analytic.userAgent,
      visitedAt: analytic.visitedAt,
    }
  }

  static serializeMany(analytics) {
    return analytics.map(analytic => this.serialize(analytic))
  }
}

export default AnalyticSerializer
