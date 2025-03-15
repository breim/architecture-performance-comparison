import AnalyticsServicePort from '../../application/interfaces/AnalyticsServicePort.js'

class AnalyticsServiceAdapter extends AnalyticsServicePort {
  constructor(baseUrl) {
    super()
    this.baseUrl = baseUrl
  }

  async trackVisit(linkId, ip, userAgent) {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
          ip,
          userAgent,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to track visit: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error tracking visit in analytics service:', error)
      return null
    }
  }

  async getAnalytics(linkId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analytics/${linkId}?page=${page}&limit=${limit}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to get analytics: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting analytics from analytics service:', error)
      throw error
    }
  }
}

export default AnalyticsServiceAdapter
