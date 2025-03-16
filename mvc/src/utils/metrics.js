import client from 'prom-client'

const register = new client.Registry()

client.collectDefaultMetrics({
  app: 'mvc-application',
  timeout: 10000,
  register,
})

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
})

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
})

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
})

export {
  register,
  httpRequestsTotal,
  httpRequestDurationMicroseconds,
  activeConnections,
}
