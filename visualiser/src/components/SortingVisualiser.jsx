import { useState, useRef, useCallback } from 'react'
import Controls from './Controls'
import ExplainBox from './ExplainBox'
import PseudoCode from './PseudoCode'
import { generateQuicksortSteps, generateMergesortSteps, randomArray } from '../algorithms'

const PSEUDOCODE = {
  quicksort: [
    'quicksort(arr, low, high):',
    '  if low < high:',
    '    pivotIdx = partition(arr, low, high)',
    '    quicksort(arr, low, pivotIdx - 1)',
    '    quicksort(arr, pivotIdx + 1, high)',
    ' ',
    'partition(arr, low, high):',
    '  pivot = arr[high]       ← pick last as pivot',
    '  i = low - 1',
    '  for j = low to high-1:',
    '    if arr[j] <= pivot:',
    '      i++; swap(arr[i], arr[j])',
    '  swap(arr[i+1], arr[high])',
    '  return i + 1',
  ],
  mergesort: [
    'mergeSort(arr):',
    '  if len(arr) <= 1: return arr',
    '  mid = len(arr) // 2',
    '  left  = mergeSort(arr[:mid])',
    '  right = mergeSort(arr[mid:])',
    '  return merge(left, right)',
    ' ',
    'merge(left, right):',
    '  result = []',
    '  while both not empty:',
    '    if left[0] <= right[0]:',
    '      result.append(left.pop(0))',
    '    else:',
    '      result.append(right.pop(0))',
    '  return result + remaining',
  ],
}

const COMPLEXITY = {
  quicksort: [{ l: 'Best', v: 'O(n log n)' }, { l: 'Average', v: 'O(n log n)' }, { l: 'Worst', v: 'O(n²)' }, { l: 'Space', v: 'O(log n)' }],
  mergesort:  [{ l: 'Best', v: 'O(n log n)' }, { l: 'Average', v: 'O(n log n)' }, { l: 'Worst', v: 'O(n log n)' }, { l: 'Space', v: 'O(n)' }],
}

function getBarClass(i, step, done) {
  if (done) return 'sorted'
  if (!step) return 'default'
  const { type, swapping = [], comparing = [], pivot, sorted = [] } = step
  if (type === 'swap'    && swapping.includes(i))  return 'swapping'
  if ((type === 'pivot' || type === 'place') && pivot === i) return 'pivot'
  if (type === 'compare' && comparing.includes(i)) return 'comparing'
  if (type === 'compare' && i === pivot)            return 'pivot'
  if (sorted.includes(i))                           return 'sorted'
  return 'default'
}

export default function SortingVisualiser() {
  const [algo, setAlgo]       = useState('quicksort')
  const [size, setSize]       = useState(12)
  const [speed, setSpeed]     = useState(5)
  const [array, setArray]     = useState([])
  const [steps, setSteps]     = useState([])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [explain, setExplain] = useState('Press <strong>Play</strong> or <strong>Step →</strong> to begin. Bars represent array values — height = value.')
  const timerRef = useRef(null)

  const init = useCallback((a, n) => {
    clearInterval(timerRef.current); setPlaying(false)
    const arr = randomArray(n)
    const s = a === 'quicksort' ? generateQuicksortSteps(arr) : generateMergesortSteps(arr)
    setArray(arr); setSteps(s); setStepIdx(0)
    setExplain(`Array of <span class="hl">${n} elements</span> ready. Press <strong>Play</strong> to watch ${a === 'quicksort' ? 'Quicksort' : 'Merge Sort'}.`)
  }, [])

  const [initialized, setInitialized] = useState(() => { setTimeout(() => init('quicksort', 12), 0); return true })

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
    const delay = Math.round(1100 - speed * 100)
    timerRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length) { clearInterval(timerRef.current); setPlaying(false); return prev }
        setExplain(steps[prev].explain)
        return prev + 1
      })
    }, delay)
  }

  function switchAlgo(a) { setAlgo(a); init(a, size) }
  function changeSize(n) { setSize(n); init(algo, n) }

  const displayArr = currentStep ? currentStep.arr : array
  const maxVal = Math.max(...(displayArr.length ? displayArr : [1]))

  const finalExplain = done
    ? `<span class="sorted-hl">✓ Sorting complete!</span> All <span class="hl">${array.length} elements</span> are now in ascending order.`
    : explain

  return (
    <div>
      <div className="algo-row">
        {['quicksort', 'mergesort'].map(a => (
          <button key={a} className={`algo-btn${algo === a ? ' active' : ''}`} onClick={() => switchAlgo(a)}>
            {a === 'quicksort' ? 'Quicksort' : 'Merge Sort'}
          </button>
        ))}
      </div>

      <div className="badges">
        {COMPLEXITY[algo].map(c => <div key={c.l} className="badge">{c.l} <span>{c.v}</span></div>)}
      </div>

      <Controls
        onPlay={play} onStep={step} onReset={() => init(algo, size)} onRandomise={() => init(algo, size)}
        playing={playing} stepDisabled={done}
        showSize size={size} onSizeChange={changeSize}
        speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${stepIdx} / ${steps.length}`}
      />

      <div className="legend">
        {[['pivot','Pivot'],['comparing','Comparing'],['swapping','Swapping'],['sorted','Sorted']].map(([cls, label]) => (
          <div key={cls} className="legend-item">
            <div className={`legend-dot ${cls}`} />{label}
          </div>
        ))}
      </div>

      <div className="viz-area">
        {displayArr.map((v, i) => {
          const cls = getBarClass(i, currentStep, done)
          const h = Math.max(10, Math.round((v / maxVal) * 185))
          return (
            <div key={i} className="bar-wrap">
              <div className={`bar ${cls}`} style={{ height: h }} />
              <div className="bar-val">{displayArr.length <= 16 ? v : ''}</div>
            </div>
          )
        })}
      </div>

      <ExplainBox html={finalExplain} />
      <PseudoCode lines={PSEUDOCODE[algo]} activeLine={currentStep?.pl ?? -1} />
    </div>
  )
}
