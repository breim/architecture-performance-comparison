class InvalidUrlError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidUrlError'
  }
}

class LinkNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'LinkNotFoundError'
  }
}

export { InvalidUrlError, LinkNotFoundError }
