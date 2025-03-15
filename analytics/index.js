import express from 'express'
import cors from 'cors'
import useragent from 'express-useragent'
import config from './config/config.js'

// Domain repositories
import PrismaAnalyticsRepository from './adapters/persistence/PrismaAnalyticsRepository.js'

// External services
import LinkServiceAdapter from './adapters/external_services/LinkServiceAdapter.js'

// Use cases
import CreateAnalyticsUseCase from './application/use_cases/CreateAnalyticsUseCase.js'
import GetAnalyticsUseCase from './application/use_cases/GetAnalyticsUseCase.js'

// Web adapters
import AnalyticsController from './adapters/web/controllers/AnalyticsController.js'
import setupAnalyticsRoutes from './adapters/web/routes/analyticsRoutes.js'

// Initialize repositories
const analyticsRepository = new PrismaAnalyticsRepository()

// Initialize external services
const linkServiceAdapter = new LinkServiceAdapter(config.shortlinkServiceUrl)

// Initialize use cases
const createAnalyticsUseCase = new CreateAnalyticsUseCase(
  analyticsRepository,
  linkServiceAdapter
)

const getAnalyticsUseCase = new GetAnalyticsUseCase(
  analyticsRepository,
  linkServiceAdapter
)

// Initialize controllers
const analyticsController = new AnalyticsController(
  createAnalyticsUseCase,
  getAnalyticsUseCase
)

// Setup Express app
const app = express()
const PORT = config.port

app.use(express.json())
app.use(cors())
app.use(useragent.express())
app.use((req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  next()
})

// Setup routes
app.use('/api', setupAnalyticsRoutes(analyticsController))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`)
})
