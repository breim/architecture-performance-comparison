import 'dotenv/config'

const config = {
  port: process.env.PORT || 3001,
  shortlinkServiceUrl:
    process.env.SHORTLINK_SERVICE_URL || 'http://localhost:3000',
}

export default config
