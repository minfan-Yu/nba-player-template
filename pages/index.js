import { useState, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const SKILLS = [
  { id: 'layup',       name: '上籃',     desc: '近框終結與手感' },
  { id: 'postUp',      name: '低位單打', desc: '背框單打得分能力' },
  { id: 'freeThrow',   name: '罰球',     desc: '無防守下的投籃穩定度' },
  { id: 'midRange',    name: '中投',     desc: '中距離空檔與抗干擾投射' },
  { id: 'threePt',     name: '三分',     desc: '外線投射能力' },
  { id: 'dribble',     name: '運球',     desc: '控球與突破防線的能力' },
  { id: 'playmaking',  name: '組織',     desc: '觀察防守與戰術執行' },
  { id: 'passing',     name: '傳球',     desc: '傳球視野與精準度' },
  { id: 'defense',     name: '防守',     desc: '單防與協防的綜合評價' },
  { id: 'block',       name: '蓋帽',     desc: '封阻對手投籃的能力' },
  { id: 'steal',       name: '抄截',     desc: '判斷傳球路徑與下手時機' },
  { id: 'rebound',     name: '籃板',     desc: '卡位意識與衝搶能力' },
  { id: 'strength',    name: '力量',     desc: '肢體對抗與卡位優勢' },
  { id: 'speed',       name: '速度',     desc: '直線衝刺與橫向移動' },
  { id: 'jump',        name: '彈跳',     desc: '垂直起跳高度與爆發力' },
  { id: 'stamina',     name: '體力',     desc: '全場來回奔跑的持久度' },
  { id: 'physique',    name: '身體素質', desc: '骨架、臂展與抗傷病能力' },
  { id: 'iq',          name: '球商',     desc: '閱讀比賽與臨場判斷' },
  { id: 'clutch',      name: '關鍵球',   desc: '關鍵時刻的抗壓與決策' },
]

const LEVELS = ['拉完了', 'NPC', '人上人', '頂級', '夯爆了']
const LEVEL_COLORS = ['#e24b4a', '#ea9326', '#efc032', '#5cb85c', '#FF8C00']

const POSITIONS = [
  { code: 'PG', name: '控球後衛' },
  { code: 'SG', name: '得分後衛' },
  { code: 'SF', name: '小前鋒' },
  { code: 'PF', name: '大前鋒' },
  { code: 'C',  name: '中鋒' },
]

function getHeightPos(h) {
  if (h < 168) return '控球後衛身材（Steph、Kyrie 類型）'
  if (h < 178) return '得分後衛身材（Kobe、Iverson 類型）'
  if (h < 188) return '小前鋒身材（LeBron、Durant 類型）'
  if (h < 198) return '大前鋒身材（KAT、Draymond 類型）'
  return '中鋒身材（Embiid、Jokic 類型）'
}

const initSkills = () => {
  const s = {}
  SKILLS.forEach(sk => { s[sk.id] = 3 })
  return s
}

// 0-99 分反推 1-5 等級
function scoreToLevel(score) {
  if (score >= 88) return 5
  if (score >= 75) return 4
  if (score >= 59) return 3
  if (score >= 40) return 2
  return 1
}

function LevelPill({ level }) {
  const color = LEVEL_COLORS[level - 1]
  const label = LEVELS[level - 1]
  return (
    <div className={styles.lvPill}>
      <div className={styles.lvDots}>
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            className={styles.lvDot}
            style={i <= level ? { background: color } : {}}
          />
        ))}
      </div>
      <span className={styles.lvPillLabel} style={{ color }}>{label}</span>
    </div>
  )
}

function SkillCompare({ userLevels, player }) {
  return (
    <div className={styles.skillCompare}>
      <div className={styles.skillCompareLegend}>
        <span className={styles.legendYou}>你</span>
        <span className={styles.legendVs}>vs</span>
        <span className={styles.legendPlayer}>{player.name}</span>
      </div>
      {SKILLS.map(sk => {
        const uLv = userLevels[sk.id] ?? 3
        const pLv = scoreToLevel(player.skills?.[sk.id] ?? 50)
        const diff = uLv - pLv
        return (
          <div key={sk.id} className={styles.compareRow}>
            <div className={styles.compareLabel}>{sk.name}</div>
            <LevelPill level={uLv} />
            <span className={`${styles.diffTag} ${diff > 0 ? styles.diffGood : diff < 0 ? styles.diffBad : styles.diffEven}`}>
              {diff > 0 ? `+${diff}` : diff === 0 ? '=' : diff}
            </span>
            <LevelPill level={pLv} />
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [height, setHeight] = useState(180)
  const [heightInput, setHeightInput] = useState('180')
  const [positions, setPositions] = useState([])
  const [skills, setSkills] = useState(initSkills)
  const [weaknesses, setWeaknesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [count, setCount] = useState(25000)

  useEffect(() => {
    fetch('/api/count')
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => {})
  }, [])

  const handleHeightChange = (e) => {
    const raw = e.target.value
    setHeightInput(raw)
    const v = parseInt(raw)
    if (!isNaN(v) && v >= 150 && v <= 220) setHeight(v)
  }

  const handleHeightBlur = () => {
    const v = parseInt(heightInput)
    if (isNaN(v) || v < 150) { setHeight(150); setHeightInput('150') }
    else if (v > 220) { setHeight(220); setHeightInput('220') }
    else { setHeight(v); setHeightInput(String(v)) }
  }

  const togglePos = (code) => {
    setPositions(prev =>
      prev.includes(code) ? prev.filter(p => p !== code) : [...prev, code]
    )
  }

  const toggleWeak = (id) => {
    setWeaknesses(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const setLevel = (id, level) => {
    setSkills(prev => ({ ...prev, [id]: level }))
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    setReport(null)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height, skills, weaknesses, positions }),
      })
      if (!res.ok) throw new Error('伺服器錯誤')
      const data = await res.json()
      setReport(data)
      setCount(c => c + 1)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (e) {
      setError('生成失敗，請再試一次。' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>NBA Scout — 找出你的籃球定位</title>
        <meta name="description" content="輸入你的身高與能力，比對 NBA 2K26 球員資料找出你最像哪位球員" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.app}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.grid} />
          <h1 className={styles.heroTitle}>NBA <span>SCOUT</span></h1>
          <p className={styles.heroSub}>找出你最像哪位 NBA 2K26 球員 🏀</p>
          <div className={styles.countBadge}>
            <span className={styles.liveDot} />
            {count.toLocaleString()} 份球探報告已生成
          </div>
        </div>

        {/* Height */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>身高設定</div>
          <div className={styles.heightCard}>
            <div className={styles.heightInputWrap}>
              <input
                type="number"
                min={150}
                max={220}
                value={heightInput}
                onChange={handleHeightChange}
                onBlur={handleHeightBlur}
                className={styles.heightInput}
              />
              <span className={styles.heightUnit}>cm</span>
            </div>
            <div className={styles.heightPos}>{getHeightPos(height)}</div>
          </div>
        </section>

        {/* Positions */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>可打位置（可多選）</div>
          <div className={styles.posRow}>
            {POSITIONS.map(({ code, name }) => {
              const active = positions.includes(code)
              return (
                <button
                  key={code}
                  className={`${styles.posBtn} ${active ? styles.posBtnActive : ''}`}
                  onClick={() => togglePos(code)}
                >
                  <span className={active ? styles.posCodeActive : styles.posCode}>{code}</span>
                  <span className={active ? styles.posNameActive : styles.posName}>{name}</span>
                </button>
              )
            })}
          </div>
          {positions.length === 0
            ? <p className={styles.posHint}>未選擇 → 比對全部球員</p>
            : <p className={styles.posHint}>已選：{positions.join('、')} · 只比對這些位置的球員</p>
          }
        </section>

        {/* Skills */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>能力自評（19 項）</div>
          <div className={styles.skillLegendRow}>
            {LEVELS.map((lv, i) => (
              <span key={i} className={styles.skillLegendItem} style={{ color: LEVEL_COLORS[i] }}>
                {i + 1} · {lv}
              </span>
            ))}
          </div>
          <p className={styles.skillLegendNote}>相對於同身材球員自評 · 點擊 W 標記弱點</p>
          <div className={styles.skillWindow}>
            {SKILLS.map(sk => {
              const lv = skills[sk.id]
              const isWeak = weaknesses.includes(sk.id)
              const color = LEVEL_COLORS[lv - 1]
              const pct = ((lv - 1) / 4) * 100
              return (
                <div
                  key={sk.id}
                  className={`${styles.skillRow} ${isWeak ? styles.skillRowWeak : ''}`}
                >
                  <button
                    className={`${styles.weakDot} ${isWeak ? styles.weakDotActive : ''}`}
                    onClick={() => toggleWeak(sk.id)}
                    title={isWeak ? '取消弱點' : '標記弱點'}
                  >W</button>
                  <div className={styles.skillInfo}>
                    <span className={styles.skillRowName}>{sk.name}</span>
                    <span className={styles.skillRowDesc}>{sk.desc}</span>
                  </div>
                  <div className={styles.skillSliderWrap}>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={lv}
                      onChange={e => setLevel(sk.id, +e.target.value)}
                      className={styles.skillSlider}
                      style={{
                        '--tc': color,
                        '--pct': `${pct}%`,
                      }}
                    />
                  </div>
                  <span className={styles.skillLvLabel} style={{ color }}>
                    {LEVELS[lv - 1]}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Generate Button */}
        <div className={styles.btnWrap}>
          <button
            className={styles.genBtn}
            onClick={generate}
            disabled={loading}
          >
            {loading ? '比對中...' : '開始比對 →'}
          </button>
          {loading && <div className={styles.progressBar}><div className={styles.progressFill} /></div>}
          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        {/* Report */}
        {report && (
          <section className={styles.reportWrap}>
            <div className={styles.reportHeader}>
              <div className={styles.ovrRow}>
                <span className={styles.ovrNum}>{report.ovr}</span>
                <span className={styles.ovrLabel}>OVR</span>
              </div>
              <div className={styles.reportPos}>{report.position}</div>
              <div className={styles.reportTier}>{report.tier}</div>
              <div className={styles.reportStyle}>風格標籤：{report.styleTag}</div>
            </div>

            {(report.badges || []).length > 0 && (
              <div className={styles.reportBody}>
                <div className={styles.badgesRow}>
                  {report.badges.map((b, i) => (
                    <span key={i} className={styles.badge}>🏅 {b}</span>
                  ))}
                </div>
              </div>
            )}

            {(report.similarPlayers || []).length > 0 && (
              <div className={styles.compareSection}>
                <div className={styles.compareSectionTitle}>你最像的 NBA 2K26 球員</div>
                <div className={styles.simRow}>
                  {report.similarPlayers.map((p, i) => (
                    <div key={i} className={`${styles.simCard} ${i === 0 ? styles.simCardTop : ''}`}>
                      <div className={styles.simRank}>{i === 0 ? '最像' : `#${i + 1}`}</div>
                      <div className={styles.simOvr}>{p.overall}</div>
                      <div className={styles.simName}>{p.name}</div>
                      <div className={styles.simMeta}>{p.position} · {p.team}</div>
                    </div>
                  ))}
                </div>
                {report.similarPlayers[0]?.skills && report.skillLevels && (
                  <SkillCompare
                    userLevels={report.skillLevels}
                    player={report.similarPlayers[0]}
                  />
                )}
              </div>
            )}
          </section>
        )}

        <footer className={styles.footer}>
          <p>資料來源：NBA 2K26 · 僅供娛樂參考</p>
        </footer>
      </main>
    </>
  )
}
