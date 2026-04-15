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

export default function Home() {
  const [height, setHeight] = useState(180)
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
        body: JSON.stringify({ height, skills, weaknesses }),
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
        <meta name="description" content="輸入你的身高與能力，AI 球探幫你分析球場定位" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.app}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.grid} />
          <h1 className={styles.heroTitle}>NBA <span>SCOUT</span></h1>
          <p className={styles.heroSub}>找出你的籃球定位 🏀</p>
          <div className={styles.countBadge}>
            <span className={styles.liveDot} />
            {count.toLocaleString()} 份球探報告已生成
          </div>
        </div>

        {/* Height */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>身高設定</div>
          <div className={styles.heightCard}>
            <div className={styles.heightNum}>{height}</div>
            <div className={styles.heightRight}>
              <div className={styles.heightPos}>{getHeightPos(height)}</div>
              <input
                type="range"
                min={150} max={220} value={height} step={1}
                onChange={e => setHeight(+e.target.value)}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>150 cm</span><span>220 cm</span>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Legend */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>能力分級說明</div>
          <div className={styles.legendRow}>
            {LEVELS.map((lv, i) => (
              <div key={i} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: LEVEL_COLORS[i] }} />
                <span style={{ color: LEVEL_COLORS[i], fontSize: 12 }}>{lv}</span>
              </div>
            ))}
          </div>
          <p className={styles.legendNote}>請相對於「同身材球員」自評，能力越高越好，有短板請標記「弱點」</p>
        </section>

        {/* Skills */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>能力自評（19 項）</div>
          <div className={styles.skillsGrid}>
            {SKILLS.map(sk => {
              const lv = skills[sk.id]
              const isWeak = weaknesses.includes(sk.id)
              return (
                <div
                  key={sk.id}
                  className={`${styles.skillCard} ${isWeak ? styles.weakCard : ''}`}
                >
                  <button
                    className={`${styles.weakBtn} ${isWeak ? styles.weakBtnActive : ''}`}
                    onClick={() => toggleWeak(sk.id)}
                  >
                    {isWeak ? '弱點 ✕' : '弱點'}
                  </button>
                  <div className={styles.skillName}>{sk.name}</div>
                  <div className={styles.skillDesc}>{sk.desc}</div>
                  <div className={styles.dotsRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        onClick={() => setLevel(sk.id, i)}
                        className={styles.dotBtn}
                        style={i <= lv ? { background: LEVEL_COLORS[lv - 1], borderColor: LEVEL_COLORS[lv - 1] } : {}}
                        aria-label={`${sk.name} 等級 ${i}`}
                      />
                    ))}
                    <span className={styles.levelLabel} style={{ color: LEVEL_COLORS[lv - 1] }}>
                      {LEVELS[lv - 1]}
                    </span>
                  </div>
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
            {loading ? '球探分析中...' : '生成球探報告 →'}
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
            <div className={styles.reportBody}>
              <p className={styles.reportText}>{report.report}</p>
              <div className={styles.badgesRow}>
                {(report.badges || []).map((b, i) => (
                  <span key={i} className={styles.badge}>🏅 {b}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <p>僅供娛樂參考 · 由 Claude AI 球探驅動</p>
          <p style={{ marginTop: 4 }}>2.0 進階版研發中 — 弱點深度分析 · 成長圖表</p>
        </footer>
      </main>
    </>
  )
}
