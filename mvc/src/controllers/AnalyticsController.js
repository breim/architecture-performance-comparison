import { handleAsyncErrors } from '../utils/errorHandler.js'
import LinkModel from '../models/LinkModel.js'
import AnalyticModel from '../models/AnalyticModel.js'
import AnalyticsSerializer from '../serializers/AnalyticsSerializer.js'

class AnalyticsController {
  static index = handleAsyncErrors(async (req, res) => {
    const { linkId } = req.params
    const { page = 1 } = req.query
    const limit = 10
    const offset = (page - 1) * limit

    const link = await LinkModel.findById(linkId)

    if (!link) {
      return res.status(404).json({ error: 'Link not found' })
    }

    const analytics = await AnalyticModel.findAnalyticsByLinkId(
      linkId,
      limit,
      offset
    )

    res.json(AnalyticsSerializer.serializeMany(analytics))
  })
}

export default AnalyticsController
