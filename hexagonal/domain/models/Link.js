class Link {
  constructor(
    id,
    originalUrl,
    shortCode,
    visitsCounter = 0,
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    this.id = id
    this.originalUrl = originalUrl
    this.shortCode = shortCode
    this.visitsCounter = visitsCounter
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  incrementVisits() {
    this.visitsCounter += 1
    this.updatedAt = new Date()
    return this
  }

  toJSON() {
    return {
      id: this.id,
      originalUrl: this.originalUrl,
      shortCode: this.shortCode,
      visitsCounter: this.visitsCounter,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export default Link
