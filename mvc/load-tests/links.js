import http from 'k6/http'
import { check, sleep } from 'k6'
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js'

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
}

const BASE_URL = 'http://localhost:3000'
let createdLinkId = ''
let shortCode = ''

export default function () {
  // Create a new link
  const createPayload = {
    url: `https://example.com/`,
    title: `Test Link ${randomString(5)}`,
  }

  const createResponse = http.post(
    `${BASE_URL}/api/links`,
    JSON.stringify(createPayload),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )

  check(createResponse, {
    'create link status is 201': r => r.status === 201,
  })

  if (createResponse.status === 201) {
    const linkData = JSON.parse(createResponse.body)
    createdLinkId = linkData.id
    shortCode = linkData.shortCode
  }

  sleep(1)

  // Get all links
  const listResponse = http.get(`${BASE_URL}/api/links`)
  check(listResponse, {
    'list links status is 200': r => r.status === 200,
  })

  sleep(1)

  // Get specific link
  if (createdLinkId) {
    const showResponse = http.get(`${BASE_URL}/api/links/${createdLinkId}`)
    check(showResponse, {
      'show link status is 200': r => r.status === 200,
    })
  }

  sleep(1)

  // Redirect using shortCode (this will create analytics data)
  if (shortCode) {
    const redirectResponse = http.get(`${BASE_URL}/${shortCode}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    // Always be 200 on the host, not on the api layer which one is 302
    check(redirectResponse, {
      'redirect status is 200': r => r.status === 200,
    })
  }

  sleep(1)

  // Update link
  if (createdLinkId) {
    const updatePayload = {
      url: `https://example.com/${randomString(8)}`,
    }

    const updateResponse = http.patch(
      `${BASE_URL}/api/links/${createdLinkId}`,
      JSON.stringify(updatePayload),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    check(updateResponse, {
      'update link status is 200': r => r.status === 200,
    })
  }

  sleep(1)

  // Get analytics for link
  if (createdLinkId) {
    const analyticsResponse = http.get(
      `${BASE_URL}/api/analytics/${createdLinkId}`
    )
    check(analyticsResponse, {
      'get analytics status is 200': r => r.status === 200,
    })
  }

  sleep(1)

  // Delete link (now safe to delete since analytics are cleaned up)
  if (createdLinkId) {
    const deleteResponse = http.del(`${BASE_URL}/api/links/${createdLinkId}`)
    console.log(deleteResponse)
    check(deleteResponse, {
      'delete link status is 204': r => r.status === 204,
    })
  }

  sleep(1)
}
