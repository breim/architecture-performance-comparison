import express from 'express'
import cors from 'cors'
import useragent from 'express-useragent'
import { handleError } from './utils/errorHandler.js'
import { config } from 'dotenv'
import {
  register,
  httpRequestsTotal,
  httpRequestDurationMicroseconds,
  activeConnections,
} from './utils/metrics.js'

import LinksController from './controllers/LinksController.js'
import AnalyticsController from './controllers/AnalyticsController.js'

config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(useragent.express())
app.use(handleError)

// Prometheus Middleware
app.use((req, res, next) => {
  const start = process.hrtime()

  activeConnections.inc()

  res.on('finish', () => {
    activeConnections.dec()

    httpRequestsTotal.labels(req.method, req.path, res.statusCode).inc()

    const [seconds, nanoseconds] = process.hrtime(start)
    const duration = seconds + nanoseconds / 1e9
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .observe(duration)
  })

  next()
})

// Prometheus endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (err) {
    res.status(500).end(err)
  }
})

// Routes
app.get('/api/links', LinksController.index)
app.post('/api/links', LinksController.create)
app.get('/api/links/:id', LinksController.show)
app.get('/:shortCode', LinksController.redirect)
app.patch('/api/links/:id', LinksController.update)
app.delete('/api/links/:id', LinksController.delete)

app.get('/api/analytics/:linkId', AnalyticsController.index)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
