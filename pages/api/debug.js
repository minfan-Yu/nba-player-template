import Redis from 'ioredis'

export default async function handler(req, res) {
  const info = {
    hasRedisUrl: !!process.env.REDIS_URL,
    urlPrefix: process.env.REDIS_URL?.slice(0, 30) ?? 'undefined',
  }

  if (!process.env.REDIS_URL) {
    return res.status(200).json({ ...info, status: 'no REDIS_URL env var' })
  }

  const redis = new Redis(process.env.REDIS_URL)
  try {
    await redis.ping()
    const count = await redis.get('report_count')
    info.status = 'connected'
    info.report_count = count
  } catch (e) {
    info.status = 'error'
    info.error = e.message
  } finally {
    redis.disconnect()
  }

  return res.status(200).json(info)
}
