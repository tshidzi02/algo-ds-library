import { useState, useRef } from 'react'
import Controls from './Controls'
import ExplainBox from './ExplainBox'
import PseudoCode from './PseudoCode'
import { generateBinarySearchSteps, randomSortedArray } from '../algorithms'

const PSEUDO = [
  'binarySearch(arr, target):',
  '  low  = 0',
  '  high = len(arr) - 1',
  '  while low <= high:',
  '    mid = (low + high) // 2',
  '    if arr[mid] == target:',
  '      return mid          ← FOUND',
  '    elif arr[mid] < target:',
  '      low = mid + 1       ← discard left half',
  '    else:',
  '      high = mid - 1      ← discard right half',
  '  return -1               ← NOT FOUND',
]

function getCellClass(i, step) {
  if (!step) return ''
  const { low, high, mid, state } = step
  if (state === 'found' && i === mid) return 'found'
  if (i === mid) return 'mid'
  if (i < low || i > high) return 'eliminated'
  if (i === low) return 'low'
  if (i === high) return 'high'
  return ''
}

export default function BinarySearchVisualiser() {
  const [array, setArray]     = useState(() => randomSortedArray(15))
  const [target, setTarget]   = useState(42)
  const [inputVal, setInputVal] = useState('42')
  const [steps, setSteps]     = useState([])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed]     = useState(5)
  const [explain, setExplain] = useState('Binary search works on a <strong>sorted array</strong>. It halves the search space each step. Press <strong>Play</strong> or <strong>Step →</strong> to begin.')
  const timerRef = useRef(null)

  function initWith(arr, tgt) {
    clearInterval(timerRef.current); setPlaying(false)
    const s = generateBinarySearchSteps(arr, tgt)
    setSteps(s); setStepIdx(0)
    setExplain(`<span class="hl">${arr.length} sorted elements</span>. Searching for target = <span class="hl">${tgt}</span>. Each step eliminates half the remaining search space.`)
  }

  const currentStep = steps[stepIdx - 1] || null
  const done = stepIdx >= steps.length && steps.length > 0

  function step() {
    if (stepIdx >= steps.length) return
    setExplain(steps[stepIdx].explain)
    setStepIdx(i => i + 1)
  }

  function play() {
    if (playing) { clearInterval(timerRef.current); setPlaying(false); return }
    setPlaying(true)
    const delay = Math.round(1300 - speed * 110)
    timerRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length) { clearInterval(timerRef.current); setPlaying(false); return prev }
        setExplain(steps[prev].explain)
        return prev + 1
      })
    }, delay)
  }

  function randomise() {
    clearInterval(timerRef.current); setPlaying(false)
    const arr = randomSortedArray(15)
    const tgt = arr[Math.floor(Math.random() * arr.length)]
    setArray(arr); setTarget(tgt); setInputVal(String(tgt))
    initWith(arr, tgt)
  }

  function applyTarget() {
    const tgt = parseInt(inputVal) || 42
    setTarget(tgt); initWith(array, tgt)
  }

  return (
    <div>
      <div className="badges">
        {[['Best','O(1)'],['Average','O(log n)'],['Worst','O(log n)'],['Space','O(1)']].map(([l,v]) => (
          <div key={l} className="badge">{l} <span>{v}</span></div>
        ))}
      </div>

      <Controls
        onPlay={play} onStep={step}
        onReset={() => initWith(array, target)}
        onRandomise={randomise}
        playing={playing} stepDisabled={done}
        speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${stepIdx} / ${steps.length}`}
      />

      <div className="legend">
        {[['low','Low pointer'],['mid','Mid (checking)'],['high','High pointer'],['found','Found!']].map(([cls, label]) => (
          <div key={cls} className="legend-item">
            <div className={`legend-dot ${cls}`} />{label}
          </div>
        ))}
      </div>

      <div className="bs-area">
        <div className="bs-row">
          {array.map((v, i) => {
            const cls = getCellClass(i, currentStep)
            const { low, high, mid, state } = currentStep || {}
            const isFound = state === 'found' && i === mid
            return (
              <div key={i} className={`bs-cell${cls ? ' ' + cls : ''}`}>
                <span className="idx">[{i}]</span>
                {v}
                {!isFound && currentStep && (
                  <>
                    {i === low  && i !== mid && <span className="bs-label l">L</span>}
                    {i === high && i !== mid && <span className="bs-label h">H</span>}
                    {i === mid              && <span className="bs-label m">M</span>}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="target-row">
          <span className="target-label">Target value:</span>
          <input
            type="number" className="target-input" value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyTarget()}
          />
          <button className="btn" onClick={applyTarget}>Set Target</button>
        </div>
      </div>

      <ExplainBox html={explain} />
      <PseudoCode lines={PSEUDO} activeLine={currentStep?.pl ?? -1} />
    </div>
  )
}
