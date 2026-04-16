import fs from 'fs'
import path from 'path'

const COUNT_FILE = path.join(process.cwd(), 'data', 'count.json')

function readLocal() {
  try {
    return JSON.parse(fs.readFileSync(COUNT_FILE, 'utf-8')).count ?? 0
  } catch {
    return 0
  }
}

export default async function handler(req, res) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      const count = await kv.get('report_count')
      return res.status(200).json({ count: Number(count) || 0 })
    }
    return res.status(200).json({ count: readLocal() })
  } catch (e) {
    console.error('count error:', e)
    return res.status(200).json({ count: 0 })
  }
}
