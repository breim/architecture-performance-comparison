import express from 'express'
import cors from 'cors'
import useragent from 'express-useragent'
import { handleError } from './utils/errorHandler.js'
import { config } from 'dotenv'

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

// Routes
app.get('/api/links', LinksController.index)
app.post('/api/links', LinksController.create)
app.get('/api/links/:id', LinksController.show)
app.get('/:shortCode', LinksController.redirect)
app.put('/api/links/:id', LinksController.update)
app.delete('/api/links/:id', LinksController.delete)

app.get('/api/analytics/:linkId', AnalyticsController.index)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
