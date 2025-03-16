import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import useragent from 'express-useragent'

// Domain
import LinkService from './domain/services/LinkService.js'

// Use Cases
import CreateLinkUseCase from './application/use_cases/CreateLinkUseCase.js'
import RedirectLinkUseCase from './application/use_cases/RedirectLinkUseCase.js'
import GetLinkAnalyticsUseCase from './application/use_cases/GetLinkAnalyticsUseCase.js'
import GetAllLinksUseCase from './application/use_cases/GetAllLinksUseCase.js'
import GetLinkByIdUseCase from './application/use_cases/GetLinkByIdUseCase.js'
import UpdateLinkUseCase from './application/use_cases/UpdateLinkUseCase.js'
import DeleteLinkUseCase from './application/use_cases/DeleteLinkUseCase.js'

// Adapters
import PrismaLinkRepository from './adapters/persistence/PrismaLinkRepository.js'
import LinkController from './adapters/web/controllers/LinkController.js'
import setupLinkRoutes from './adapters/web/routes/linkRoutes.js'
import setupRedirectRoutes from './adapters/web/routes/redirectRoutes.js'
import AnalyticsServiceAdapter from './adapters/external_services/AnalyticsServiceAdapter.js'
import PrometheusMetricsAdapter from './adapters/metrics/PrometheusMetricsAdapter.js'
import createMetricsMiddleware from './adapters/middleware/metricsMiddleware.js'

// Inicialização dos adaptadores
const linkRepository = new PrismaLinkRepository()
const analyticsServiceUrl =
  process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3001'
const analyticsServiceAdapter = new AnalyticsServiceAdapter(analyticsServiceUrl)
const metricsAdapter = new PrometheusMetricsAdapter()

const linkService = new LinkService()

const createLinkUseCase = new CreateLinkUseCase(linkService, linkRepository)
const redirectLinkUseCase = new RedirectLinkUseCase(
  linkRepository,
  analyticsServiceAdapter
)
const getLinkAnalyticsUseCase = new GetLinkAnalyticsUseCase(
  linkRepository,
  analyticsServiceAdapter
)
const getAllLinksUseCase = new GetAllLinksUseCase(linkRepository)
const getLinkByIdUseCase = new GetLinkByIdUseCase(linkRepository)
const updateLinkUseCase = new UpdateLinkUseCase(linkService, linkRepository)
const deleteLinkUseCase = new DeleteLinkUseCase(linkRepository)

const linkController = new LinkController(
  createLinkUseCase,
  redirectLinkUseCase,
  getLinkAnalyticsUseCase,
  getAllLinksUseCase,
  getLinkByIdUseCase,
  updateLinkUseCase,
  deleteLinkUseCase
)

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(useragent.express())
app.use((req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  next()
})

// Adiciona o middleware de métricas
app.use(createMetricsMiddleware(metricsAdapter))

// Endpoint de métricas do Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metricsAdapter.getContentType())
    res.end(await metricsAdapter.getMetrics())
  } catch (err) {
    res.status(500).end(err)
  }
})

app.use('/api', setupLinkRoutes(linkController))
app.use('/', setupRedirectRoutes(linkController))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
