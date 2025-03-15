class CreateAnalyticsDTO {
  constructor(linkId, ip, userAgent) {
    this.linkId = linkId
    this.ip = ip
    this.userAgent = userAgent
  }

  validate() {
    if (!this.linkId) {
      throw new Error('LinkId is required')
    }
    if (!this.ip) {
      throw new Error('IP is required')
    }
    if (!this.userAgent) {
      throw new Error('User Agent is required')
    }
    return true
  }
}

export default CreateAnalyticsDTO
