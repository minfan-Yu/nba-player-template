import fs from 'fs'
import path from 'path'

// 1-5 等級 → 0-99 分
const LEVEL_TO_SCORE = { 1: 30, 2: 50, 3: 68, 4: 82, 5: 93 }

function loadPlayers() {
  try {
    const p = path.join(process.cwd(), 'data', 'nba2k26.json')
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return []
  }
}

function toScore(skills) {
  const out = {}
  for (const [k, v] of Object.entries(skills)) {
    out[k] = LEVEL_TO_SCORE[v] ?? 50
  }
  return out
}

// 依身高調整各項權重，算出 OVR
function calcOVR(s, h) {
  const g = h < 185   // 後衛
  const b = h >= 200  // 中鋒
  const w = {
    layup:      g ? 0.07 : b ? 0.09 : 0.08,
    postUp:     b ? 0.08 : g ? 0.03 : 0.05,
    freeThrow:  0.04,
    midRange:   0.06,
    threePt:    g ? 0.07 : 0.05,
    dribble:    g ? 0.08 : b ? 0.04 : 0.06,
    playmaking: g ? 0.07 : 0.05,
    passing:    0.05,
    defense:    0.08,
    block:      b ? 0.06 : 0.03,
    steal:      0.04,
    rebound:    b ? 0.07 : g ? 0.03 : 0.05,
    strength:   0.04,
    speed:      0.05,
    jump:       0.04,
    stamina:    0.05,
    physique:   0.04,
    iq:         0.07,
    clutch:     0.06,
  }
  let tot = 0, wt = 0
  for (const [k, wv] of Object.entries(w)) {
    tot += (s[k] ?? 50) * wv
    wt += wv
  }
  // 線性映射：avg=30 → OVR 55，avg=93 → OVR 95
  const avg = tot / wt
  return Math.max(50, Math.min(99, Math.round(55 + (avg - 30) * 40 / 63)))
}

function calcTier(ovr) {
  if (ovr >= 93) return '歷史級球員'
  if (ovr >= 88) return '全明星球員'
  if (ovr >= 80) return '先發球員'
  if (ovr >= 70) return '輪換球員'
  return '板凳球員'
}

function calcPosition(s, h) {
  if (h >= 200) {
    if (s.block > 70 && s.rebound > 70) return '護框長人'
    if (s.postUp > 75) return '低位支柱'
    if (s.passing > 68) return '策應中鋒'
    return '油漆區霸主'
  }
  if (h >= 193) {
    if (s.defense > 75 && s.rebound > 68) return '鐵血大前鋒'
    if (s.threePt > 70) return '拉開空間大前鋒'
    return '全能前鋒'
  }
  if (h >= 185) {
    if (s.defense > 74) return '3D 側翼'
    if (s.threePt > 70 && s.dribble > 64) return '攻擊型側翼'
    if (s.layup > 72) return '切入型前鋒'
    return '得分前鋒'
  }
  if (s.playmaking > 70 && s.passing > 66) return '場上指揮官'
  if (s.threePt > 73 && s.dribble > 70) return '冷血射手'
  if (s.speed > 74 && s.layup > 68) return '閃電突破手'
  if (s.defense > 72) return '防守型後衛'
  return '全能後衛'
}

function calcStyleTag(s) {
  const map = {
    layup: '暴力美學', threePt: '冷血射手', dribble: '街球靈魂',
    playmaking: '隱形指揮家', defense: '鐵血悍將', block: '空中統治者',
    rebound: '搶板機器', speed: '速度殺手', iq: '場上智者',
    clutch: '關鍵先生', strength: '力量怪獸', postUp: '低位藝術家',
    passing: '傳球大師', steal: '神偷俠盜', jump: '爆發彈力',
    midRange: '中距離詩人', stamina: '永動引擎', physique: '身體工程',
    freeThrow: '罰線狙擊手',
  }
  const top = Object.entries(s).sort((a, b) => b[1] - a[1])[0][0]
  return map[top] ?? '全能瑞士刀'
}

function calcBadges(s) {
  return [
    [s.layup >= 75,      '終結大師'],
    [s.threePt >= 78,    '神射手'],
    [s.midRange >= 78,   '中距離大師'],
    [s.dribble >= 78,    '運球大師'],
    [s.playmaking >= 78, '發動機'],
    [s.passing >= 78,    '視野如電'],
    [s.defense >= 78,    '貼身剋星'],
    [s.block >= 75,      '拒絕入場'],
    [s.steal >= 75,      '扒手大師'],
    [s.rebound >= 78,    '籃板王'],
    [s.clutch >= 80,     '大心臟'],
    [s.speed >= 78,      '閃電俠'],
    [s.iq >= 78,         '球場智者'],
    [s.postUp >= 78,     '低位殺器'],
    [s.strength >= 80,   '力量型球員'],
  ].filter(([c]) => c).map(([, n]) => n).slice(0, 5)
}

// 歐幾里德距離比對，找最相似球員
function findSimilar(s, players, n = 3) {
  const keys = Object.keys(s)
  return players
    .map(p => {
      let sumSq = 0, cnt = 0
      for (const k of keys) {
        if (p.skills?.[k] != null) {
          sumSq += (s[k] - p.skills[k]) ** 2
          cnt++
        }
      }
      const rms = cnt > 0 ? Math.sqrt(sumSq / cnt) : 999
      return { name: p.name, overall: p.overall, position: p.position, team: p.team, skills: p.skills, rms }
    })
    .sort((a, b) => a.rms - b.rms)
    .slice(0, n)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { height, skills } = req.body
  if (!height || !skills) return res.status(400).json({ error: 'Missing fields' })

  const s99 = toScore(skills)
  const ovr = calcOVR(s99, height)
  const players = loadPlayers()

  // 更新計數器（選填：Vercel KV）
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await fetch(`${process.env.KV_REST_API_URL}/incr/report_count`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      })
    }
  } catch (_) {}

  return res.status(200).json({
    ovr,
    tier:           calcTier(ovr),
    position:       calcPosition(s99, height),
    styleTag:       calcStyleTag(s99),
    badges:         calcBadges(s99),
    skills99:       s99,
    similarPlayers: findSimilar(s99, players, 3),
  })
}
