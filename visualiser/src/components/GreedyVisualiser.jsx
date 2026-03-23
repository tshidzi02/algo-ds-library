import { useState, useRef } from 'react'
import ExplainBox from './ExplainBox'
import PseudoCode from './PseudoCode'
import Controls from './Controls'

// ════════════════════════════════════════════════════════
//  ACTIVITY SELECTION — animated Gantt chart
// ════════════════════════════════════════════════════════
const ACT_PSEUDO = [
  'activitySelection(activities):',
  '  sort by finish time',
  '  selected = [activities[0]]',
  '  last_finish = activities[0].finish',
  '  for act in activities[1:]:',
  '    if act.start >= last_finish:',
  '      selected.append(act)',
  '      last_finish = act.finish',
  '  return selected',
]

const DEFAULT_ACTS = [
  {name:'A', start:1, finish:4},
  {name:'B', start:3, finish:5},
  {name:'C', start:0, finish:6},
  {name:'D', start:5, finish:7},
  {name:'E', start:3, finish:9},
  {name:'F', start:5, finish:9},
  {name:'G', start:6, finish:10},
  {name:'H', start:8, finish:11},
]

function generateActSteps(acts) {
  const sorted = [...acts].sort((a,b) => a.finish - b.finish)
  const steps = []

  steps.push({
    sorted, selected: new Set(), current: -1, lastFinish: -1, pl: 1,
    explain: `<span class="hl">Sort ${acts.length} activities by finish time.</span> Greedy key insight: always pick the earliest-finishing compatible activity — this leaves the maximum room for everything that follows.`
  })

  steps.push({
    sorted, selected: new Set([0]), current: 0, lastFinish: sorted[0].finish, pl: 2,
    explain: `<span class="sorted-hl">✓ Select "${sorted[0].name}"</span> automatically — it finishes earliest (at ${sorted[0].finish}) so it's always optimal to take it. The green bar is now reserved. last_finish = ${sorted[0].finish}.`
  })

  const selected = new Set([0])
  let lastFinish = sorted[0].finish

  for (let i = 1; i < sorted.length; i++) {
    const act = sorted[i]
    const ok = act.start >= lastFinish
    steps.push({
      sorted, selected: new Set(selected), current: i, lastFinish, pl: 5,
      explain: `Checking <span class="pivot-hl">"${act.name}"</span>: start=<span class="hl">${act.start}</span>, finish=${act.finish}. Does start (${act.start}) ≥ last_finish (${lastFinish})? <span class="${ok ? 'sorted-hl' : 'compare-hl'}">${ok ? '✓ Yes — no overlap, select it!' : '✗ No — overlaps with previous selection, skip.'}</span>`
    })

    if (ok) {
      selected.add(i)
      lastFinish = act.finish
      steps.push({
        sorted, selected: new Set(selected), current: i, lastFinish, pl: 6,
        explain: `<span class="sorted-hl">✓ Selected "${act.name}"</span>. The bar turns green. last_finish advances to ${act.finish}. Selected so far: [${[...selected].map(j => sorted[j].name).join(', ')}].`
      })
    }
  }

  steps.push({
    sorted, selected: new Set(selected), current: -1, lastFinish, done: true, pl: 8,
    explain: `<span class="sorted-hl">✓ Complete! Maximum non-overlapping set: [${[...selected].map(i => sorted[i].name).join(', ')}]</span> — ${selected.size} activities. No larger valid selection exists. The greedy choice of "earliest finish" is provably optimal.`
  })
  return steps
}

function ActivityVisualiser() {
  const [steps, setSteps] = useState(() => generateActSteps(DEFAULT_ACTS))
  const [idx, setIdx]     = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(5)
  const [explain, setExplain] = useState('Each row is an activity. Green = selected, orange = currently checking, grey = rejected. Press <strong>Play</strong>.')
  const timerRef = useRef(null)

  const step = steps[idx - 1] || null
  const done = idx >= steps.length && steps.length > 0
  const sorted   = step?.sorted || [...DEFAULT_ACTS].sort((a,b)=>a.finish-b.finish)
  const selected = step?.selected || new Set()
  const current  = step?.current ?? -1
  const lastFinish = step?.lastFinish ?? -1
  const maxEnd = Math.max(...DEFAULT_ACTS.map(a => a.finish))

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
  function reset() {
    clearInterval(timerRef.current); setPlaying(false)
    setSteps(generateActSteps(DEFAULT_ACTS)); setIdx(0)
    setExplain('Each row is an activity. Green = selected, orange = currently checking, grey = rejected. Press <strong>Play</strong>.')
  }

  return (
    <div>
      <div className="badges">
        {[['Time','O(n log n)'],['Space','O(n)'],['Strategy','Earliest finish greedy']].map(([l,v]) => (
          <div key={l} className="badge">{l} <span>{v}</span></div>
        ))}
      </div>
      <Controls onPlay={play} onStep={doStep} onReset={reset} onRandomise={reset}
        playing={playing} stepDisabled={done} speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${idx} / ${steps.length}`} />

      {/* Legend */}
      <div className="legend" style={{marginBottom:'12px'}}>
        <div className="legend-item"><div className="legend-dot sorted" />Selected</div>
        <div className="legend-item"><div className="legend-dot pivot" />Checking</div>
        <div className="legend-item"><div className="legend-dot comparing" />Rejected (overlap)</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--surface2)',border:'1px solid var(--border)'}} />Not yet checked</div>
      </div>

      {/* Gantt Chart */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'4px', padding:'20px', marginBottom:'16px'
      }}>
        {/* Time axis */}
        <div style={{display:'flex', marginLeft:'40px', marginBottom:'8px', position:'relative', height:'18px'}}>
          {Array.from({length: maxEnd + 1}, (_, i) => (
            <div key={i} style={{
              flex: i === 0 ? 0 : 1,
              fontSize:'0.58rem', color:'var(--muted)',
              borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
              paddingLeft:'3px', paddingTop:'2px'
            }}>{i > 0 ? i : ''}</div>
          ))}
        </div>

        {/* Activity rows */}
        {sorted.map((act, i) => {
          const isSel  = selected.has(i)
          const isCur  = current === i
          const isRej  = step && !isSel && !isCur && i < current
          const leftPct  = (act.start  / maxEnd) * 100
          const widthPct = ((act.finish - act.start) / maxEnd) * 100

          let barBg     = 'var(--surface2)'
          let barBorder = 'var(--border)'
          let barColor  = 'var(--muted)'
          let glow      = 'none'
          if (isSel && isCur)  { barBg='rgba(125,184,122,0.4)'; barBorder='var(--sorted-color)'; barColor='var(--sorted-color)'; glow='0 0 10px rgba(125,184,122,0.3)' }
          else if (isSel)      { barBg='rgba(125,184,122,0.25)'; barBorder='var(--sorted-color)'; barColor='var(--sorted-color)' }
          else if (isCur)      { barBg='rgba(196,169,107,0.35)'; barBorder='var(--pivot-color)'; barColor='var(--pivot-color)'; glow='0 0 12px rgba(196,169,107,0.4)' }
          else if (isRej)      { barBg='rgba(143,191,168,0.1)'; barBorder='rgba(143,191,168,0.3)'; barColor='var(--muted)' }

          return (
            <div key={i} style={{display:'flex', alignItems:'center', marginBottom:'6px', height:'32px'}}>
              {/* Name */}
              <div style={{
                width:'32px', fontSize:'0.7rem', fontWeight:'700',
                color: isSel ? 'var(--sorted-color)' : isCur ? 'var(--pivot-color)' : 'var(--muted)',
                textAlign:'right', paddingRight:'8px', flexShrink:0, transition:'color 0.3s'
              }}>{act.name}</div>

              {/* Track */}
              <div style={{flex:1, height:'28px', position:'relative', background:'var(--surface2)', borderRadius:'2px'}}>
                {/* Last finish line */}
                {lastFinish > 0 && (
                  <div style={{
                    position:'absolute', left:`${(lastFinish/maxEnd)*100}%`,
                    top:0, bottom:0, width:'2px',
                    background:'rgba(240,230,200,0.3)',
                    borderLeft:'1px dashed rgba(240,230,200,0.4)',
                    zIndex:1
                  }} />
                )}
                {/* Activity bar */}
                <div style={{
                  position:'absolute',
                  left:`${leftPct}%`, width:`${widthPct}%`,
                  top:'3px', bottom:'3px',
                  background: barBg, border:`1px solid ${barBorder}`,
                  borderRadius:'3px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.65rem', fontWeight:'700', color: barColor,
                  transition:'all 0.3s ease',
                  boxShadow: glow,
                  overflow:'hidden', whiteSpace:'nowrap'
                }}>
                  {act.name} ({act.start}–{act.finish})
                </div>
              </div>

              {/* Status icon */}
              <div style={{width:'24px', textAlign:'center', fontSize:'0.75rem', flexShrink:0}}>
                {isSel ? '✓' : isRej ? '✗' : ''}
              </div>
            </div>
          )
        })}

        {/* Last finish indicator label */}
        {lastFinish > 0 && (
          <div style={{
            marginLeft:'40px', marginTop:'4px', fontSize:'0.6rem',
            color:'rgba(240,230,200,0.6)', letterSpacing:'0.08em'
          }}>
            ↑ last_finish = {lastFinish}
          </div>
        )}
      </div>

      {/* Selected count */}
      {step && (
        <div style={{
          display:'flex', gap:'8px', alignItems:'center',
          marginBottom:'16px', flexWrap:'wrap'
        }}>
          <span style={{fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Selected:</span>
          {[...selected].map(i => (
            <div key={i} style={{
              padding:'4px 10px', background:'rgba(125,184,122,0.15)',
              border:'1px solid var(--sorted-color)', borderRadius:'2px',
              fontSize:'0.72rem', fontWeight:'700', color:'var(--sorted-color)'
            }}>{sorted[i].name} ({sorted[i].start}–{sorted[i].finish})</div>
          ))}
        </div>
      )}

      <ExplainBox html={explain} />
      <PseudoCode lines={ACT_PSEUDO} activeLine={step?.pl ?? -1} />
    </div>
  )
}

// ════════════════════════════════════════════════════════
//  HUFFMAN — visual frequency bars + code table
// ════════════════════════════════════════════════════════
const HUFF_PSEUDO = [
  'huffman(text):',
  '  freq = count frequencies',
  '  heap = min-heap of leaf nodes',
  '  while len(heap) > 1:',
  '    left  = heappop()   ← lowest freq',
  '    right = heappop()   ← 2nd lowest',
  '    merged = Node(left.freq + right.freq)',
  '    heappush(heap, merged)',
  '  codes = traverse tree (left=0, right=1)',
]

function computeHuffmanSteps(text) {
  if (!text) return { steps: [], codes: {} }
  const freq = {}
  for (const c of text) freq[c] = (freq[c] || 0) + 1
  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const steps = []

  steps.push({ freq: entries, merging: null, codes: {}, pl: 1,
    explain: `<span class="hl">Count frequencies</span> in "${text.length > 20 ? text.slice(0,20)+'...' : text}". The bar chart shows how often each character appears. Frequent characters = short codes, rare characters = long codes.` })

  // Build actual Huffman tree
  let nodes = entries.map(([c, f]) => ({ char: c, freq: f, left: null, right: null, id: c }))
  let mergeCount = 0

  while (nodes.length > 1) {
    nodes.sort((a,b) => a.freq - b.freq)
    const left  = nodes.shift()
    const right = nodes.shift()
    mergeCount++
    steps.push({
      freq: entries, merging: [left.char || `[${mergeCount}a]`, right.char || `[${mergeCount}b]`],
      mergeLeft: left, mergeRight: right,
      newFreq: left.freq + right.freq,
      codes: {}, pl: 4,
      explain: `<span class="pivot-hl">Merge step ${mergeCount}:</span> take the two lowest-frequency nodes — <span class="low-hl">"${left.char || '[internal]'}" (${left.freq})</span> and <span class="high-hl">"${right.char || '[internal]'}" (${right.freq})</span>. Create parent node with freq = <span class="hl">${left.freq + right.freq}</span>.`
    })
    nodes.push({ char: null, freq: left.freq + right.freq, left, right, id: `m${mergeCount}` })
  }

  // Generate codes
  const codes = {}
  function assignCodes(node, code) {
    if (!node) return
    if (node.char) { codes[node.char] = code || '0'; return }
    assignCodes(node.left, code + '0')
    assignCodes(node.right, code + '1')
  }
  if (nodes.length > 0) assignCodes(nodes[0], '')

  const origBits = text.length * 8
  const compBits = text.split('').reduce((s, c) => s + (codes[c]?.length || 0), 0)
  const saving = Math.round((1 - compBits / origBits) * 100)

  steps.push({ freq: entries, merging: null, codes, origBits, compBits, saving, done: true, pl: 8,
    explain: `<span class="sorted-hl">✓ Huffman tree built!</span> Original: <span class="compare-hl">${origBits} bits</span>. Compressed: <span class="sorted-hl">${compBits} bits</span>. Saving: <span class="hl">${saving}%</span>. Frequent characters get short codes — the greedy merge ensures this is optimal.` })

  return { steps, codes }
}

function HuffmanVisualiser() {
  const defaultText = "hello world"
  const [text, setText]       = useState(defaultText)
  const [input, setInput]     = useState(defaultText)
  const initData = computeHuffmanSteps(defaultText)
  const [steps, setSteps]     = useState(initData.steps)
  const [idx, setIdx]         = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed]     = useState(5)
  const [explain, setExplain] = useState('The bars show character frequencies. Taller bar = more common = shorter Huffman code. Press <strong>Play</strong>.')
  const timerRef = useRef(null)

  const step = steps[idx - 1] || null
  const done = idx >= steps.length && steps.length > 0
  const freq = step?.freq || []
  const codes = step?.codes || {}
  const maxFreq = Math.max(...freq.map(([,f]) => f), 1)

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
  function applyText() {
    clearInterval(timerRef.current); setPlaying(false)
    const t = input.trim() || 'hello'
    setText(t)
    const { steps: s } = computeHuffmanSteps(t)
    setSteps(s); setIdx(0)
    setExplain('The bars show character frequencies. Taller bar = more common = shorter Huffman code. Press <strong>Play</strong>.')
  }

  return (
    <div>
      <div className="badges">
        {[['Time','O(n log n)'],['Space','O(n)'],['Strategy','Min-heap greedy merge']].map(([l,v]) => (
          <div key={l} className="badge">{l} <span>{v}</span></div>
        ))}
      </div>
      <Controls onPlay={play} onStep={doStep} onReset={applyText} onRandomise={applyText}
        playing={playing} stepDisabled={done} speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${idx} / ${steps.length}`} />

      <div className="target-row" style={{marginBottom:'20px'}}>
        <span className="target-label">Text:</span>
        <input className="target-input" style={{width:'220px'}} value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && applyText()} />
        <button className="btn" onClick={applyText}>Set</button>
      </div>

      {/* Frequency bar chart */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'4px', padding:'20px 16px 8px', marginBottom:'16px',
        display:'flex', alignItems:'flex-end', gap:'8px', minHeight:'130px'
      }}>
        {freq.map(([c, f]) => {
          const isMerging = step?.merging?.includes(c)
          const isLeft    = step?.mergeLeft?.char === c
          const isRight   = step?.mergeRight?.char === c
          const h = Math.max(20, Math.round((f / maxFreq) * 100))
          let bg = 'var(--surface2)', border = 'var(--border)', color = 'var(--muted)'
          if (isLeft)       { bg='rgba(122,172,184,0.3)'; border='var(--low-color)'; color='var(--low-color)' }
          else if (isRight) { bg='rgba(196,169,107,0.3)'; border='var(--high-color)'; color='var(--high-color)' }
          else if (done && codes[c]) { bg='rgba(125,184,122,0.25)'; border='var(--sorted-color)'; color='var(--sorted-color)' }
          return (
            <div key={c} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
              <div style={{fontSize:'0.65rem', fontWeight:'700', color, transition:'color 0.3s'}}>{f}</div>
              <div style={{
                width:'100%', height: h,
                background: bg, border:`1px solid ${border}`,
                borderRadius:'2px 2px 0 0',
                transition:'all 0.3s',
                boxShadow: isMerging ? `0 0 8px rgba(196,169,107,0.3)` : 'none'
              }} />
              <div style={{
                fontSize:'0.75rem', fontWeight:'700',
                color, transition:'color 0.3s'
              }}>{c === ' ' ? '␣' : c}</div>
            </div>
          )
        })}
      </div>

      {/* Merge animation */}
      {step?.mergeLeft && step?.mergeRight && (
        <div style={{
          display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap',
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'4px', padding:'12px 16px', marginBottom:'16px'
        }}>
          <div style={{
            padding:'8px 14px', border:'1px solid var(--low-color)',
            borderRadius:'3px', background:'rgba(122,172,184,0.15)',
            fontSize:'0.8rem', color:'var(--low-color)', fontWeight:'700'
          }}>
            {step.mergeLeft.char ? `"${step.mergeLeft.char}"` : '[internal]'} = {step.mergeLeft.freq}
          </div>
          <span style={{fontSize:'1.1rem', color:'var(--muted)'}}>+</span>
          <div style={{
            padding:'8px 14px', border:'1px solid var(--high-color)',
            borderRadius:'3px', background:'rgba(196,169,107,0.15)',
            fontSize:'0.8rem', color:'var(--high-color)', fontWeight:'700'
          }}>
            {step.mergeRight.char ? `"${step.mergeRight.char}"` : '[internal]'} = {step.mergeRight.freq}
          </div>
          <span style={{fontSize:'1.1rem', color:'var(--muted)'}}>=</span>
          <div style={{
            padding:'8px 14px', border:'1px solid var(--accent)',
            borderRadius:'3px', background:'rgba(125,184,122,0.15)',
            fontSize:'0.8rem', color:'var(--accent)', fontWeight:'700'
          }}>
            new node = {step.newFreq}
          </div>
        </div>
      )}

      {/* Code table — shown when done */}
      {Object.keys(codes).length > 0 && (
        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'4px', marginBottom:'16px', overflow:'hidden'
        }}>
          <div style={{
            display:'grid', gridTemplateColumns:'60px 80px 1fr 80px 80px',
            padding:'8px 16px', background:'var(--surface2)',
            fontSize:'0.6rem', color:'var(--muted)', letterSpacing:'0.1em',
            textTransform:'uppercase', borderBottom:'1px solid var(--border)'
          }}>
            <span>Char</span><span>Freq</span><span>Code</span><span>Length</span><span>Fixed (8)</span>
          </div>
          {freq.map(([c, f]) => {
            const code = codes[c] || '—'
            const saving = code !== '—' ? 8 - code.length : 0
            return (
              <div key={c} style={{
                display:'grid', gridTemplateColumns:'60px 80px 1fr 80px 80px',
                padding:'8px 16px', fontSize:'0.76rem',
                borderBottom:'1px solid var(--border)',
                background: step?.merging?.includes(c) ? 'rgba(196,169,107,0.08)' : 'transparent'
              }}>
                <span style={{color:'var(--accent3)', fontWeight:'700'}}>'{c === ' ' ? '␣' : c}'</span>
                <span style={{color:'var(--text)'}}>{f}×</span>
                <span style={{color:'var(--low-color)', fontFamily:'var(--font-mono)', letterSpacing:'0.15em'}}>{code}</span>
                <span style={{color:'var(--text)'}}>{code.length}</span>
                <span style={{color: saving > 0 ? 'var(--sorted-color)' : saving < 0 ? 'var(--compare-color)' : 'var(--muted)', fontWeight:'700'}}>
                  {saving > 0 ? `−${saving}` : saving < 0 ? `+${Math.abs(saving)}` : '='}
                </span>
              </div>
            )
          })}
          {/* Stats footer */}
          {step?.origBits && (
            <div style={{
              padding:'10px 16px', borderTop:'1px solid var(--border)',
              display:'flex', gap:'20px', fontSize:'0.7rem', background:'var(--surface2)'
            }}>
              <span style={{color:'var(--compare-color)'}}>Original: {step.origBits} bits</span>
              <span style={{color:'var(--sorted-color)'}}>Compressed: {step.compBits} bits</span>
              <span style={{color:'var(--accent3)', fontWeight:'700'}}>Saving: {step.saving}%</span>
            </div>
          )}
        </div>
      )}

      <ExplainBox html={explain} />
      <PseudoCode lines={HUFF_PSEUDO} activeLine={step?.pl ?? -1} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function GreedyVisualiser() {
  const [sub, setSub] = useState('activity')
  return (
    <div>
      <div className="algo-row">
        {[['activity','Activity Selection'],['huffman','Huffman Coding']].map(([id,label]) => (
          <button key={id} className={`algo-btn${sub===id?' active':''}`} onClick={() => setSub(id)}>{label}</button>
        ))}
      </div>
      {sub === 'activity' && <ActivityVisualiser />}
      {sub === 'huffman'  && <HuffmanVisualiser />}
    </div>
  )
}
