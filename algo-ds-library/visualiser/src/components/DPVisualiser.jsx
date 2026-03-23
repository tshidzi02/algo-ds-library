import { useState, useRef } from 'react'
import ExplainBox from './ExplainBox'
import PseudoCode from './PseudoCode'
import Controls from './Controls'

// ════════════════════════════════════════════════════════
//  FIBONACCI — animated bar chart showing sequence grow
// ════════════════════════════════════════════════════════
const FIB_PSEUDO = [
  'fib(n):',
  '  if n <= 1: return n',
  '  prev, curr = 0, 1',
  '  for i in range(2, n+1):',
  '    prev, curr = curr, prev + curr',
  '  return curr',
]

function generateFibSteps(n) {
  const steps = []
  if (n <= 1) {
    steps.push({
      table: [0, 1].slice(0, n + 1),
      prevIdx: null, currIdx: n, computingIdx: null, pl: 1,
      explain: `F(${n}) = <span class="hl">${n}</span> — base case, returned immediately.`
    })
    return steps
  }

  steps.push({
    table: [0, 1], prevIdx: 0, currIdx: 1, computingIdx: null, pl: 2,
    explain: `Base cases: <span class="low-hl">F(0) = 0</span> and <span class="mid-hl">F(1) = 1</span>. These are our starting points. We slide a two-value window forward — O(1) space, no array needed.`
  })

  const table = [0, 1]
  for (let i = 2; i <= n; i++) {
    const next = table[i - 1] + table[i - 2]
    // Show the "about to compute" state with arrow
    steps.push({
      table: [...table], prevIdx: i - 2, currIdx: i - 1, computingIdx: i, pl: 3,
      explain: `Computing F(${i}): adding <span class="low-hl">F(${i-2}) = ${table[i-2]}</span> + <span class="mid-hl">F(${i-1}) = ${table[i-1]}</span> = <span class="hl">${next}</span>.`
    })
    table.push(next)
    // Show the result placed
    steps.push({
      table: [...table], prevIdx: i - 1, currIdx: i, computingIdx: null, pl: 4,
      explain: `<span class="sorted-hl">F(${i}) = ${next}</span> placed. Window slides right — prev = F(${i-1}), curr = F(${i}). ${i < n ? `Next: compute F(${i+1}).` : 'Done!'}`
    })
  }

  steps.push({
    table: [...table], prevIdx: null, currIdx: n, computingIdx: null, done: true, pl: 5,
    explain: `<span class="sorted-hl">✓ F(${n}) = ${table[n]}</span>. Each bar's height shows its Fibonacci value. Notice how values grow <span class="hl">exponentially</span> — that's why the naive recursive O(2ⁿ) approach is so slow compared to this O(n) solution.`
  })
  return steps
}

function FibVisualiser() {
  const [n, setN]         = useState(10)
  const [steps, setSteps] = useState(() => generateFibSteps(10))
  const [idx, setIdx]     = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(5)
  const [explain, setExplain] = useState('Each bar represents a Fibonacci number. Watch the sequence grow as the window slides right. Press <strong>Play</strong> to begin.')
  const timerRef = useRef(null)

  const step = steps[idx - 1] || null
  const done = idx >= steps.length && steps.length > 0
  const table = step ? step.table : [0, 1]
  const maxVal = Math.max(...table, 1)

  function doStep() {
    if (idx >= steps.length) return
    setExplain(steps[idx].explain); setIdx(i => i + 1)
  }
  function play() {
    if (playing) { clearInterval(timerRef.current); setPlaying(false); return }
    setPlaying(true)
    const delay = Math.round(1100 - speed * 100)
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= steps.length) { clearInterval(timerRef.current); setPlaying(false); return prev }
        setExplain(steps[prev].explain); return prev + 1
      })
    }, delay)
  }
  function reset(newN = n) {
    clearInterval(timerRef.current); setPlaying(false)
    setSteps(generateFibSteps(newN)); setIdx(0)
    setExplain('Each bar represents a Fibonacci number. Watch the sequence grow as the window slides right. Press <strong>Play</strong> to begin.')
  }

  // Bar colours
  function barStyle(i) {
    if (!step) return { bg: 'var(--surface2)', border: 'var(--border)', label: 'var(--muted)' }
    if (step.computingIdx === i) return { bg: 'rgba(196,169,107,0.15)', border: 'var(--pivot-color)', label: 'var(--pivot-color)' }
    if (step.currIdx === i)      return { bg: 'rgba(143,191,168,0.4)',  border: 'var(--mid-color)',   label: 'var(--mid-color)' }
    if (step.prevIdx === i)      return { bg: 'rgba(122,172,184,0.3)',  border: 'var(--low-color)',   label: 'var(--low-color)' }
    if (done)                    return { bg: 'rgba(125,184,122,0.3)',  border: 'var(--sorted-color)', label: 'var(--sorted-color)' }
    if (i < (step.currIdx ?? 0)) return { bg: 'rgba(125,184,122,0.2)', border: 'var(--border)',       label: 'var(--muted)' }
    return { bg: 'var(--surface2)', border: 'var(--border)', label: 'var(--muted)' }
  }

  return (
    <div>
      <div className="badges">
        {[['Time','O(n)'],['Space','O(1)'],['Strategy','Sliding window DP']].map(([l,v]) => (
          <div key={l} className="badge">{l} <span>{v}</span></div>
        ))}
      </div>

      <Controls onPlay={play} onStep={doStep} onReset={() => reset()} onRandomise={() => reset()}
        playing={playing} stepDisabled={done} speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${idx} / ${steps.length}`} />

      <div className="target-row" style={{marginBottom:'20px'}}>
        <span className="target-label">Compute F(n), n =</span>
        <input type="number" className="target-input" min={2} max={15} value={n}
          onChange={e => { const v = Math.min(15, Math.max(2, +e.target.value)); setN(v); reset(v) }} />
      </div>

      {/* Legend */}
      <div className="legend" style={{marginBottom:'12px'}}>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--low-color)'}} />prev (F(i-2))</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--mid-color)'}} />curr (F(i-1))</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--pivot-color)'}} />computing</div>
        <div className="legend-item"><div className="legend-dot sorted" />done</div>
      </div>

      {/* Bar chart */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'4px', padding:'24px 16px 8px', marginBottom:'16px',
        minHeight:'200px', display:'flex', alignItems:'flex-end', gap:'4px'
      }}>
        {table.map((v, i) => {
          const s = barStyle(i)
          const h = Math.max(18, Math.round((v / maxVal) * 160))
          const isComputing = step?.computingIdx === i
          return (
            <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
              {/* Value label on top */}
              <div style={{fontSize:'0.6rem', color: s.label, fontWeight:'700', minHeight:'16px', transition:'color 0.3s'}}>
                {isComputing ? '?' : v}
              </div>
              {/* Bar */}
              <div style={{
                width:'100%', height: isComputing ? h * 0.5 : h,
                background: s.bg, border:`1px solid ${s.border}`,
                borderRadius:'2px 2px 0 0',
                transition:'height 0.3s ease, background 0.3s ease, border-color 0.3s ease',
                boxSizing:'border-box',
                ...(isComputing ? {borderStyle:'dashed'} : {})
              }} />
              {/* Index label */}
              <div style={{fontSize:'0.55rem', color:'var(--muted)'}}>F({i})</div>
              {/* Arrow indicator */}
              {step && (step.prevIdx === i || step.currIdx === i || step.computingIdx === i) && (
                <div style={{
                  fontSize:'0.55rem', fontWeight:'700',
                  color: step.computingIdx === i ? 'var(--pivot-color)' : step.currIdx === i ? 'var(--mid-color)' : 'var(--low-color)',
                  letterSpacing:'0.05em'
                }}>
                  {step.computingIdx === i ? '▲new' : step.currIdx === i ? '▲curr' : '▲prev'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Two-variable display */}
      {step && (
        <div style={{
          display:'flex', gap:'12px', marginBottom:'16px'
        }}>
          <div style={{
            flex:1, padding:'12px 16px', background:'var(--surface)',
            border:'1px solid var(--low-color)', borderRadius:'4px', textAlign:'center'
          }}>
            <div style={{fontSize:'0.6rem', color:'var(--low-color)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'4px'}}>prev</div>
            <div style={{fontSize:'1.4rem', fontWeight:'700', color:'var(--low-color)'}}>
              {step.prevIdx !== null ? table[step.prevIdx] ?? '—' : '—'}
            </div>
          </div>
          <div style={{
            display:'flex', alignItems:'center', fontSize:'1.2rem', color:'var(--muted)'
          }}>+</div>
          <div style={{
            flex:1, padding:'12px 16px', background:'var(--surface)',
            border:'1px solid var(--mid-color)', borderRadius:'4px', textAlign:'center'
          }}>
            <div style={{fontSize:'0.6rem', color:'var(--mid-color)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'4px'}}>curr</div>
            <div style={{fontSize:'1.4rem', fontWeight:'700', color:'var(--mid-color)'}}>
              {step.currIdx !== null ? table[step.currIdx] ?? '—' : '—'}
            </div>
          </div>
          <div style={{
            display:'flex', alignItems:'center', fontSize:'1.2rem', color:'var(--muted)'
          }}>=</div>
          <div style={{
            flex:1, padding:'12px 16px', background:'var(--surface)',
            border:`1px solid ${step.computingIdx !== null ? 'var(--pivot-color)' : 'var(--border)'}`,
            borderRadius:'4px', textAlign:'center'
          }}>
            <div style={{fontSize:'0.6rem', color: step.computingIdx !== null ? 'var(--pivot-color)' : 'var(--muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'4px'}}>next</div>
            <div style={{fontSize:'1.4rem', fontWeight:'700', color: step.computingIdx !== null ? 'var(--pivot-color)' : 'var(--muted)'}}>
              {step.computingIdx !== null
                ? (table[step.prevIdx] ?? 0) + (table[step.currIdx] ?? 0)
                : '—'}
            </div>
          </div>
        </div>
      )}

      <ExplainBox html={explain} />
      <PseudoCode lines={FIB_PSEUDO} activeLine={step?.pl ?? -1} />
    </div>
  )
}

// ════════════════════════════════════════════════════════
//  COIN CHANGE — visual DP table with animated arrows
// ════════════════════════════════════════════════════════
const COIN_PSEUDO = [
  'coinChange(coins, amount):',
  '  dp = [∞] × (amount + 1)',
  '  dp[0] = 0',
  '  for i = 1 to amount:',
  '    for coin in coins:',
  '      if coin ≤ i and dp[i-coin] ≠ ∞:',
  '        dp[i] = min(dp[i], dp[i-coin] + 1)',
  '  return dp[amount]',
]

function generateCoinSteps(coins, amount) {
  const INF = Infinity
  const dp = new Array(amount + 1).fill(INF)
  const usedCoin = new Array(amount + 1).fill(null)
  dp[0] = 0
  const steps = []

  steps.push({
    dp: [...dp], usedCoin: [...usedCoin],
    activeCell: 0, checkingFrom: null, coin: null, pl: 2,
    explain: `Initialise: dp[0] = <span class="hl">0</span> (zero coins needed for amount 0). All other cells start at <span class="compare-hl">∞</span> (unreachable). We fill the table left to right, each cell depending on previous results.`
  })

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        if (dp[i - coin] !== INF) {
          const candidate = dp[i - coin] + 1
          steps.push({
            dp: [...dp], usedCoin: [...usedCoin],
            activeCell: i, checkingFrom: i - coin, coin, pl: 5,
            explain: `Amount <span class="hl">${i}</span>: try coin <span class="pivot-hl">${coin}</span>. Look back at dp[${i}−${coin}] = dp[${i-coin}] = <span class="low-hl">${dp[i-coin]}</span>. Adding 1 coin gives <span class="hl">${candidate}</span>. ${candidate < dp[i] ? `<span class="sorted-hl">New best!</span> Update dp[${i}] = ${candidate}.` : `dp[${i}] = ${dp[i] === INF ? '∞' : dp[i]} is already better — keep it.`}`
          })
          if (candidate < dp[i]) {
            dp[i] = candidate
            usedCoin[i] = coin
            steps.push({
              dp: [...dp], usedCoin: [...usedCoin],
              activeCell: i, checkingFrom: null, coin: null, pl: 6,
              explain: `<span class="sorted-hl">✓ dp[${i}] updated to ${candidate}</span> using coin <span class="pivot-hl">${coin}</span>. This means amount ${i} can be made with ${candidate} coin${candidate > 1 ? 's' : ''}.`
            })
          }
        }
      }
    }
  }

  // Build path for final step
  const path = []
  let rem = amount
  while (rem > 0 && usedCoin[rem]) { path.push(usedCoin[rem]); rem -= usedCoin[rem] }

  steps.push({
    dp: [...dp], usedCoin: [...usedCoin],
    activeCell: amount, checkingFrom: null, coin: null, done: true, path, pl: 7,
    explain: dp[amount] === INF
      ? `<span class="compare-hl">✗ Impossible.</span> Amount ${amount} cannot be made with coins [${coins.join(', ')}].`
      : `<span class="sorted-hl">✓ Minimum coins for ${amount} = ${dp[amount]}</span>. Coins used: [${path.join(' + ')}]. Each cell was built from previous results — that's the power of DP.`
  })
  return steps
}

function CoinChangeVisualiser() {
  const [coins, setCoins]   = useState([1, 5, 10, 25])
  const [amount, setAmount] = useState(11)
  const [coinInput, setCoinInput] = useState('1,5,10,25')
  const [steps, setSteps]   = useState(() => generateCoinSteps([1,5,10,25], 11))
  const [idx, setIdx]       = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed]   = useState(5)
  const [explain, setExplain] = useState('Watch the DP table fill left to right. Each cell = minimum coins to make that amount. Press <strong>Play</strong> to begin.')
  const timerRef = useRef(null)

  const step = steps[idx - 1] || null
  const done = idx >= steps.length && steps.length > 0
  const dp = step ? step.dp : new Array(amount + 1).fill(Infinity)
  const maxVal = Math.max(...dp.filter(v => v !== Infinity), 1)

  function doStep() {
    if (idx >= steps.length) return
    setExplain(steps[idx].explain); setIdx(i => i + 1)
  }
  function play() {
    if (playing) { clearInterval(timerRef.current); setPlaying(false); return }
    setPlaying(true)
    const delay = Math.round(1000 - speed * 90)
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= steps.length) { clearInterval(timerRef.current); setPlaying(false); return prev }
        setExplain(steps[prev].explain); return prev + 1
      })
    }, delay)
  }
  function reset(c = coins, a = amount) {
    clearInterval(timerRef.current); setPlaying(false)
    setSteps(generateCoinSteps(c, a)); setIdx(0)
    setExplain('Watch the DP table fill left to right. Each cell = minimum coins to make that amount. Press <strong>Play</strong> to begin.')
  }
  function applyCoins() {
    const c = coinInput.split(',').map(Number).filter(n => n > 0)
    setCoins(c); reset(c, amount)
  }

  function cellStyle(i) {
    if (!step) return { bg: 'var(--surface2)', border: 'var(--border)', color: 'var(--muted)' }
    if (step.activeCell === i && step.checkingFrom === null)
      return { bg: 'rgba(125,184,122,0.25)', border: 'var(--sorted-color)', color: 'var(--sorted-color)' }
    if (step.activeCell === i)
      return { bg: 'rgba(196,169,107,0.2)', border: 'var(--pivot-color)', color: 'var(--pivot-color)' }
    if (step.checkingFrom === i)
      return { bg: 'rgba(122,172,184,0.2)', border: 'var(--low-color)', color: 'var(--low-color)' }
    if (step.done && step.path && i <= amount) {
      // highlight path cells
      const pathCells = new Set()
      let rem = amount
      const uc = step.usedCoin
      while (rem > 0 && uc[rem]) { pathCells.add(rem); rem -= uc[rem] }
      pathCells.add(0)
      if (pathCells.has(i)) return { bg: 'rgba(125,184,122,0.2)', border: 'var(--sorted-color)', color: 'var(--sorted-color)' }
    }
    if (dp[i] !== Infinity)
      return { bg: 'rgba(125,184,122,0.08)', border: 'var(--border)', color: 'var(--text)' }
    return { bg: 'var(--surface2)', border: 'var(--border)', color: 'var(--muted)' }
  }

  return (
    <div>
      <div className="badges">
        {[['Time','O(a × c)'],['Space','O(amount)'],['Strategy','Bottom-Up DP']].map(([l,v]) => (
          <div key={l} className="badge">{l} <span>{v}</span></div>
        ))}
      </div>

      <Controls onPlay={play} onStep={doStep} onReset={() => reset()} onRandomise={() => reset()}
        playing={playing} stepDisabled={done} speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${idx} / ${steps.length}`} />

      <div className="target-row" style={{marginBottom:'16px', flexWrap:'wrap', gap:'12px'}}>
        <span className="target-label">Coins:</span>
        <input className="target-input" style={{width:'130px'}} value={coinInput}
          onChange={e => setCoinInput(e.target.value)} onKeyDown={e => e.key==='Enter' && applyCoins()} />
        <button className="btn" onClick={applyCoins}>Set</button>
        <span className="target-label">Amount:</span>
        <input type="number" className="target-input" min={1} max={25} value={amount}
          onChange={e => { const v = Math.min(25, Math.max(1, +e.target.value)); setAmount(v); reset(coins, v) }} />
      </div>

      {/* Legend */}
      <div className="legend" style={{marginBottom:'12px'}}>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--low-color)'}} />Looking back from</div>
        <div className="legend-item"><div className="legend-dot pivot" />Current cell</div>
        <div className="legend-item"><div className="legend-dot sorted" />Updated / solved</div>
      </div>

      {/* Coin chips */}
      <div style={{display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center'}}>
        <span style={{fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Coins:</span>
        {coins.map(c => (
          <div key={c} style={{
            width:'40px', height:'40px', borderRadius:'50%',
            background: step?.coin === c ? 'rgba(196,169,107,0.4)' : 'var(--surface2)',
            border: `2px solid ${step?.coin === c ? 'var(--pivot-color)' : 'var(--border)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'0.75rem', fontWeight:'700',
            color: step?.coin === c ? 'var(--pivot-color)' : 'var(--muted)',
            transition:'all 0.2s',
            boxShadow: step?.coin === c ? '0 0 10px rgba(196,169,107,0.3)' : 'none'
          }}>{c}</div>
        ))}
        {step?.activeCell != null && step?.checkingFrom != null && (
          <span style={{fontSize:'0.7rem', color:'var(--muted)', marginLeft:'8px'}}>
            dp[<span style={{color:'var(--pivot-color)'}}>{step.activeCell}</span>] = dp[<span style={{color:'var(--low-color)'}}>{step.checkingFrom}</span>] + 1
          </span>
        )}
      </div>

      {/* DP table as bar chart */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'4px', padding:'20px 12px 8px', marginBottom:'16px',
        minHeight:'160px', display:'flex', alignItems:'flex-end', gap:'3px',
        position:'relative', overflowX:'auto'
      }}>
        {/* Arrow from checkingFrom to activeCell */}
        {step?.checkingFrom != null && step?.activeCell != null && (
          <div style={{
            position:'absolute', top:'8px', left:'12px', right:'12px',
            fontSize:'0.6rem', color:'var(--low-color)', display:'flex',
            alignItems:'center', gap:'4px', letterSpacing:'0.08em'
          }}>
            <span style={{color:'var(--low-color)'}}>dp[{step.checkingFrom}]={dp[step.checkingFrom]}</span>
            <span style={{color:'var(--muted)'}}>──── +1 coin ({step.coin}) ────▶</span>
            <span style={{color:'var(--pivot-color)'}}>dp[{step.activeCell}]</span>
          </div>
        )}

        {dp.map((v, i) => {
          const s = cellStyle(i)
          const h = v === Infinity ? 16 : Math.max(20, Math.round((v / maxVal) * 130))
          const isActive = step?.activeCell === i
          const isFrom   = step?.checkingFrom === i
          return (
            <div key={i} style={{flex:1, minWidth:'28px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px'}}>
              <div style={{
                fontSize:'0.6rem', fontWeight:'700', minHeight:'16px',
                color: s.color, transition:'color 0.3s'
              }}>
                {v === Infinity ? '∞' : v}
              </div>
              <div style={{
                width:'100%', height: h,
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius:'2px 2px 0 0',
                transition:'all 0.25s ease',
                boxSizing:'border-box',
                boxShadow: isActive || isFrom ? `0 0 8px ${isActive ? 'rgba(196,169,107,0.3)' : 'rgba(122,172,184,0.3)'}` : 'none'
              }} />
              <div style={{fontSize:'0.52rem', color:'var(--muted)'}}>{i}</div>
            </div>
          )
        })}
      </div>

      {/* Final answer coins display */}
      {done && step?.path?.length > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap',
          background:'var(--surface)', border:'1px solid var(--sorted-color)',
          borderRadius:'4px', padding:'12px 16px', marginBottom:'16px'
        }}>
          <span style={{fontSize:'0.65rem', color:'var(--sorted-color)', textTransform:'uppercase', letterSpacing:'0.1em'}}>
            Answer — coins used:
          </span>
          {step.path.map((c, i) => (
            <div key={i} style={{
              width:'36px', height:'36px', borderRadius:'50%',
              background:'rgba(125,184,122,0.2)',
              border:'2px solid var(--sorted-color)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.75rem', fontWeight:'700', color:'var(--sorted-color)'
            }}>{c}</div>
          ))}
          <span style={{fontSize:'0.75rem', color:'var(--text)'}}>
            = {amount} using <span style={{color:'var(--sorted-color)', fontWeight:'700'}}>{step.path.length}</span> coin{step.path.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <ExplainBox html={explain} />
      <PseudoCode lines={COIN_PSEUDO} activeLine={step?.pl ?? -1} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function DPVisualiser() {
  const [sub, setSub] = useState('fibonacci')
  return (
    <div>
      <div className="algo-row">
        {[['fibonacci','Fibonacci'],['coinchange','Coin Change']].map(([id,label]) => (
          <button key={id} className={`algo-btn${sub===id?' active':''}`} onClick={() => setSub(id)}>{label}</button>
        ))}
      </div>
      {sub === 'fibonacci'  && <FibVisualiser />}
      {sub === 'coinchange' && <CoinChangeVisualiser />}
    </div>
  )
}
