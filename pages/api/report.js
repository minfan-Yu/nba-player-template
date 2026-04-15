import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const LEVELS = ['拉完了', 'NPC', '人上人', '頂級', '夯爆了']

function getHeightPos(h) {
  if (h < 168) return '控球後衛身材（Steph、Kyrie 類型）'
  if (h < 178) return '得分後衛身材（Kobe、Allen Iverson 類型）'
  if (h < 188) return '小前鋒身材（LeBron、Durant 類型）'
  if (h < 198) return '大前鋒身材（KAT、Draymond 類型）'
  return '中鋒身材（Embiid、Jokic 類型）'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { height, skills, weaknesses } = req.body

  if (!height || !skills) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const SKILL_NAMES = {
    layup: '上籃', postUp: '低位單打', freeThrow: '罰球',
    midRange: '中投', threePt: '三分', dribble: '運球',
    playmaking: '組織', passing: '傳球', defense: '防守',
    block: '蓋帽', steal: '抄截', rebound: '籃板',
    strength: '力量', speed: '速度', jump: '彈跳',
    stamina: '體力', physique: '身體素質', iq: '球商', clutch: '關鍵球',
  }

  const skillLines = Object.entries(skills).map(([id, level]) => {
    const weak = weaknesses?.includes(id) ? '（明顯弱點）' : ''
    return `${SKILL_NAMES[id] || id}：${LEVELS[level - 1]}${weak}`
  }).join('\n')

  const prompt = `你是一位風格辛辣、有個性的 NBA 球探，請根據以下業餘球員資料，生成一份真實感十足的球探報告。請用繁體中文回應。

身高：${height}cm（${getHeightPos(height)}）

各項能力（等級由低到高：拉完了 < NPC < 人上人 < 頂級 < 夯爆了）：
${skillLines}

請以 JSON 格式回應，不要加 markdown code block，直接輸出純 JSON：
{
  "ovr": 數字（50-99，根據整體能力評估）,
  "tier": "等級標籤（歷史級球員 / 全明星球員 / 先發球員 / 輪換球員 / 板凳球員）",
  "position": "球場定位名稱（有創意的中文名稱，例如：復古中距離大師、籃下護框機器、全場奔跑引擎）",
  "report": "3-4句話的球探分析，風格辛辣有個性，說出這個球員的核心特質、優勢與限制",
  "styleTag": "風格標籤（例如：暴力美學 / 鐵血硬漢 / 冷血射手 / 全能瑞士刀 / 速度殺手）",
  "badges": ["NBA 2K 風格徽章1", "徽章2", "徽章3"]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content.map(c => c.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    // 更新計數器（如果有設定 Vercel KV）
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await fetch(`${process.env.KV_REST_API_URL}/incr/report_count`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        })
      }
    } catch (_) {
      // 計數器失敗不影響主流程
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('Report generation error:', error)
    return res.status(500).json({ error: '生成失敗，請再試一次' })
  }
}
