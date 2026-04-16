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
      const r = await fetch(`${process.env.KV_REST_API_URL}/get/report_count`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      })
      const data = await r.json()
      const count = parseInt(data.result)
      return res.status(200).json({ count: isNaN(count) ? 0 : count })
    }
    return res.status(200).json({ count: readLocal() })
  } catch {
    return res.status(200).json({ count: 0 })
  }
}
