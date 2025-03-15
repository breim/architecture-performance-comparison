class GetAnalyticsDTO {
  constructor(linkId, page = 1, limit = 10) {
    this.linkId = linkId
    this.page = parseInt(page)
    this.limit = parseInt(limit)
  }

  validate() {
    if (!this.linkId) {
      throw new Error('LinkId is required')
    }
    if (isNaN(this.page) || this.page < 1) {
      throw new Error('Page must be a positive number')
    }
    if (isNaN(this.limit) || this.limit < 1) {
      throw new Error('Limit must be a positive number')
    }
    return true
  }

  getOffset() {
    return (this.page - 1) * this.limit
  }
}

export default GetAnalyticsDTO
