import express from 'express';
import cors from 'cors';
import useragent from 'express-useragent';
import { config } from 'dotenv';
import client from 'prom-client';
import { measureRequestDuration } from './metrics/prometheus.js';
import LinkController from './controllers/LinkController.js';
import AnalyticsController from './controllers/AnalyticsController.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(useragent.express());
app.use(measureRequestDuration);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Link Routes
app.post('/api/links', LinkController.create);
app.get('/api/links', LinkController.index);
app.get('/api/links/:id', LinkController.show);
app.put('/api/links/:id', LinkController.update);
app.delete('/api/links/:id', LinkController.delete);

// Analytics Routes
app.get('/api/analytics/link/:linkId', AnalyticsController.getLinkAnalytics);
app.get('/api/analytics/overall', AnalyticsController.getOverallAnalytics);

// Root route for redirects
app.get('/:shortCode', LinkController.redirect);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
