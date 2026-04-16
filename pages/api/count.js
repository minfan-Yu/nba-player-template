import fs from 'fs'
import path from 'path'

const COUNT_FILE = path.join(process.cwd(), 'data', 'count.json')
const BASE = 25000

function readLocal() {
  try {
    return JSON.parse(fs.readFileSync(COUNT_FILE, 'utf-8')).count ?? BASE
  } catch {
    return BASE
  }
}

export default async function handler(req, res) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const r = await fetch(`${process.env.KV_REST_API_URL}/get/report_count`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      })
      const data = await r.json()
      return res.status(200).json({ count: parseInt(data.result) || BASE })
    }
    return res.status(200).json({ count: readLocal() })
  } catch {
    return res.status(200).json({ count: BASE })
  }
}
