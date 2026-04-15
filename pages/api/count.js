export default async function handler(req, res) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const r = await fetch(`${process.env.KV_REST_API_URL}/get/report_count`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      })
      const data = await r.json()
      return res.status(200).json({ count: parseInt(data.result) || 25000 })
    }
    return res.status(200).json({ count: 25000 })
  } catch (_) {
    return res.status(200).json({ count: 25000 })
  }
}
