class Analytics {
  constructor(id, linkId, ip, userAgent, visitedAt = new Date()) {
    this.id = id
    this.linkId = linkId
    this.ip = ip
    this.userAgent = userAgent
    this.visitedAt = visitedAt
  }

  toJSON() {
    return {
      id: this.id,
      linkId: this.linkId,
      ip: this.ip,
      userAgent: this.userAgent,
      visitedAt: this.visitedAt,
    }
  }
}

export default Analytics
