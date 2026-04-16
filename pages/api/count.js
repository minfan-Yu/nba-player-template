import fs from 'fs'
import path from 'path'
import Redis from 'ioredis'

const COUNT_FILE = path.join(process.cwd(), 'data', 'count.json')

function readLocal() {
  try {
    return JSON.parse(fs.readFileSync(COUNT_FILE, 'utf-8')).count ?? 0
  } catch {
    return 0
  }
}

export default async function handler(req, res) {
  if (!process.env.REDIS_URL) {
    return res.status(200).json({ count: readLocal() })
  }

  const redis = new Redis(process.env.REDIS_URL)
  try {
    const val = await redis.get('report_count')
    return res.status(200).json({ count: Number(val) || 0 })
  } catch (e) {
    console.error('Redis get error:', e.message)
    return res.status(200).json({ count: 0 })
  } finally {
    redis.disconnect()
  }
}
