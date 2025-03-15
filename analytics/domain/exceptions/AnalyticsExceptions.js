class AnalyticsError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class LinkNotFoundError extends AnalyticsError {
  constructor(message) {
    super(message || 'Link not found')
  }
}

class InvalidAnalyticsDataError extends AnalyticsError {
  constructor(message) {
    super(message || 'Invalid analytics data')
  }
}

export { AnalyticsError, LinkNotFoundError, InvalidAnalyticsDataError }
