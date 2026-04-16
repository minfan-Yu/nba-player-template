export default async function handler(req, res) {
  const info = {
    hasKvUrl:   !!process.env.KV_REST_API_URL,
    hasKvToken: !!process.env.KV_REST_API_TOKEN,
    kvUrlPrefix: process.env.KV_REST_API_URL?.slice(0, 40) ?? 'undefined',
  }

  try {
    const { kv } = await import('@vercel/kv')
    const val = await kv.get('report_count')
    info.kvGet = val
    info.kvStatus = 'ok'
  } catch (e) {
    info.kvStatus = 'error'
    info.kvError = e.message
  }

  return res.status(200).json(info)
}
