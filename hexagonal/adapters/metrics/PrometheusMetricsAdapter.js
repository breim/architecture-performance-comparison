import client from 'prom-client'

class PrometheusMetricsAdapter {
  constructor() {
    this.register = new client.Registry()

    client.collectDefaultMetrics({
      app: 'hexagonal-application',
      timeout: 10000,
      register: this.register,
    })

    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register],
    })

    this.httpRequestDurationMicroseconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    })

    this.activeConnections = new client.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.register],
    })
  }

  incrementRequestCount(method, path, status) {
    this.httpRequestsTotal.labels(method, path, status).inc()
  }

  observeRequestDuration(method, path, status, duration) {
    this.httpRequestDurationMicroseconds
      .labels(method, path, status)
      .observe(duration)
  }

  incrementActiveConnections() {
    this.activeConnections.inc()
  }

  decrementActiveConnections() {
    this.activeConnections.dec()
  }

  async getMetrics() {
    return await this.register.metrics()
  }

  getContentType() {
    return this.register.contentType
  }
}

export default PrometheusMetricsAdapter
