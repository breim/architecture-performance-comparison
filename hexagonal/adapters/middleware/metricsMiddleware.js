const createMetricsMiddleware = metricsAdapter => {
  return (req, res, next) => {
    const start = process.hrtime()

    metricsAdapter.incrementActiveConnections()

    res.on('finish', () => {
      metricsAdapter.decrementActiveConnections()

      metricsAdapter.incrementRequestCount(req.method, req.path, res.statusCode)

      const [seconds, nanoseconds] = process.hrtime(start)
      const duration = seconds + nanoseconds / 1e9
      metricsAdapter.observeRequestDuration(
        req.method,
        req.path,
        res.statusCode,
        duration
      )
    })

    next()
  }
}

export default createMetricsMiddleware
