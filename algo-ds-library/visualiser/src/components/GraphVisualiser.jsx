import { useState, useRef, useEffect, useCallback } from 'react'
import Controls from './Controls'
import ExplainBox from './ExplainBox'
import PseudoCode from './PseudoCode'

const PSEUDO = {
  dfs: [
    'dfs(graph, start):',
    '  visited = set()',
    '  stack   = [start]',
    '  while stack:',
    '    node = stack.pop()',
    '    if node not in visited:',
    '      visited.add(node)',
    '      for neighbour in graph[node]:',
    '        if neighbour not in visited:',
    '          stack.append(neighbour)',
  ],
  bfs: [
    'bfs(graph, start):',
    '  visited = {start}',
    '  queue   = deque([start])',
    '  while queue:',
    '    node = queue.popleft()',
    '    for neighbour in graph[node]:',
    '      if neighbour not in visited:',
    '        visited.add(neighbour)',
    '        queue.append(neighbour)',
  ],
}

// ── Fixed demo graph layout ────────────────────────────────────────────────
const NODES = {
  A: { x: 300, y:  60 },
  B: { x: 160, y: 170 },
  C: { x: 440, y: 170 },
  D: { x:  70, y: 290 },
  E: { x: 240, y: 290 },
  F: { x: 380, y: 290 },
  G: { x: 530, y: 290 },
  H: { x: 150, y: 400 },
  I: { x: 450, y: 400 },
}

const EDGES = [
  ['A','B'],['A','C'],
  ['B','D'],['B','E'],
  ['C','F'],['C','G'],
  ['D','H'],['E','H'],
  ['F','I'],['G','I'],
]

// Build adjacency list from EDGES
function buildGraph() {
  const g = {}
  Object.keys(NODES).forEach(n => g[n] = [])
  EDGES.forEach(([a,b]) => { g[a].push(b); g[b].push(a) })
  return g
}

// ── Step generators ────────────────────────────────────────────────────────
function generateDFSSteps(start) {
  const graph = buildGraph()
  const steps = []
  const visited = new Set()
  const stack = [start]

  steps.push({
    visited: [], current: null, stack: [start], queue: [],
    pl: 2,
    explain: `Initialise: <span class="hl">stack = [${start}]</span>, visited = {}. DFS uses a stack — it always explores the most recently added node first, going as <span class="sorted-hl">deep</span> as possible before backtracking.`
  })

  while (stack.length > 0) {
    const node = stack.pop()
    steps.push({
      visited: [...visited], current: node, stack: [...stack], queue: [],
      pl: 4,
      explain: `<span class="pivot-hl">Popped "${node}"</span> from the top of the stack. Stack now: [${stack.join(', ') || '∅'}]. Is "${node}" already visited? <span class="hl">${visited.has(node) ? 'Yes — skip' : 'No — process it'}</span>.`
    })

    if (!visited.has(node)) {
      visited.add(node)
      const neighbours = graph[node].filter(n => !visited.has(n))
      steps.push({
        visited: [...visited], current: node, stack: [...stack], queue: [],
        pl: 6,
        explain: `<span class="sorted-hl">✓ Visited "${node}"</span>. Unvisited neighbours: [${neighbours.join(', ') || '∅'}]. Push them onto the stack — they'll be explored next.`
      })
      // Push in reverse so left-to-right order is preserved
      for (let i = neighbours.length - 1; i >= 0; i--) {
        stack.push(neighbours[i])
      }
      if (neighbours.length > 0) {
        steps.push({
          visited: [...visited], current: node, stack: [...stack], queue: [],
          pl: 7,
          explain: `Pushed [${neighbours.join(', ')}] onto the stack. Stack is now: [${stack.join(', ')}]. Next pop will take <span class="pivot-hl">"${stack[stack.length-1]}"</span>.`
        })
      }
    }
  }

  steps.push({
    visited: [...visited], current: null, stack: [], queue: [], done: true,
    pl: -1,
    explain: `<span class="sorted-hl">✓ DFS complete!</span> Visited all ${visited.size} nodes: [${[...visited].join(' → ')}]. DFS explored deep paths first — notice it went all the way down one branch before backtracking.`
  })
  return steps
}

function generateBFSSteps(start, endNode = null) {
  const graph = buildGraph()
  const steps = []
  const visited = new Set([start])
  const queue = [start]
  const parent = { [start]: null }

  steps.push({
    visited: [start], current: null, stack: [], queue: [...queue],
    pl: 1,
    explain: `Initialise: <span class="hl">queue = [${start}]</span>, visited = {${start}}. BFS uses a queue — it explores all neighbours at the current depth before going deeper. This guarantees the <span class="sorted-hl">shortest path</span>.`
  })

  while (queue.length > 0) {
    const node = queue.shift()
    steps.push({
      visited: [...visited], current: node, stack: [], queue: [...queue],
      pl: 3,
      explain: `<span class="pivot-hl">Dequeued "${node}"</span> from the front. Queue now: [${queue.join(', ') || '∅'}]. Processing all of "${node}"'s unvisited neighbours.`
    })

    const neighbours = graph[node].filter(n => !visited.has(n))
    for (const nb of neighbours) {
      visited.add(nb)
      queue.push(nb)
      parent[nb] = node
    }

    if (neighbours.length > 0) {
      steps.push({
        visited: [...visited], current: node, stack: [], queue: [...queue],
        pl: 5,
        explain: `Found unvisited neighbours of "${node}": [${neighbours.join(', ')}]. Added to queue. Queue is now: [${queue.join(', ')}]. These will be processed <span class="sorted-hl">level by level</span>.`
      })
    }

    if (endNode && visited.has(endNode)) {
      // Build shortest path
      const path = []
      let cur = endNode
      while (cur !== null) { path.unshift(cur); cur = parent[cur] }
      steps.push({
        visited: [...visited], current: node, stack: [], queue: [...queue],
        shortestPath: path, done: true,
        pl: -1,
        explain: `<span class="sorted-hl">✓ Found target "${endNode}"!</span> Shortest path from ${start} → ${endNode}: <span class="hl">[${path.join(' → ')}]</span> (${path.length - 1} hops). BFS guarantees this is the shortest because it explores level by level.`
      })
      return steps
    }
  }

  steps.push({
    visited: [...visited], current: null, stack: [], queue: [], done: true,
    pl: -1,
    explain: `<span class="sorted-hl">✓ BFS complete!</span> Visited all ${visited.size} nodes level by level: [${[...visited].join(' → ')}]. Compare this order to DFS — BFS stays shallow and broad.`
  })
  return steps
}

// ── Node style logic ──────────────────────────────────────────────────────
const NODE_STYLES = {
  default:  { fill: '#293527', stroke: '#364832', strokeWidth: 2,   textFill: '#7a8c72', glow: 'none' },
  visited:  { fill: '#2a4a35', stroke: '#7db87a', strokeWidth: 2.5, textFill: '#7db87a', glow: 'drop-shadow(0 0 6px rgba(125,184,122,0.5))' },
  current:  { fill: '#4a3a1a', stroke: '#c4a96b', strokeWidth: 3,   textFill: '#f0e6c8', glow: 'drop-shadow(0 0 10px rgba(196,169,107,0.7))' },
  path:     { fill: '#3a3a1a', stroke: '#f0e6c8', strokeWidth: 3,   textFill: '#f0e6c8', glow: 'drop-shadow(0 0 10px rgba(240,230,200,0.6))' },
}

const EDGE_STYLES = {
  default: { stroke: '#364832', strokeWidth: 2 },
  path:    { stroke: '#f0e6c8', strokeWidth: 3.5 },
}

function getNodeState(id, step, shortestPath) {
  if (!step) return 'default'
  if (shortestPath && shortestPath.length > 0 && shortestPath.includes(id)) return 'path'
  if (step.current === id) return 'current'
  if (step.visited && step.visited.includes(id)) return 'visited'
  return 'default'
}

// ── SVG Graph ─────────────────────────────────────────────────────────────
function GraphSVG({ step, shortestPath }) {
  const sp = shortestPath || (step?.shortestPath) || []
  const spEdges = new Set()
  for (let i = 0; i < sp.length - 1; i++) {
    spEdges.add(`${sp[i]}-${sp[i+1]}`)
    spEdges.add(`${sp[i+1]}-${sp[i]}`)
  }

  return (
    <svg viewBox="0 0 600 460" style={{width:'100%', height:'auto', display:'block'}}>
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="1.5" fill="#364832" />
        </marker>
      </defs>

      {/* Edges */}
      {EDGES.map(([a, b]) => {
        const isPath = spEdges.has(`${a}-${b}`)
        const es = isPath ? EDGE_STYLES.path : EDGE_STYLES.default
        return (
          <line key={`${a}-${b}`}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke={es.stroke}
            strokeWidth={es.strokeWidth}
            strokeLinecap="round"
            style={{transition:'stroke 0.3s, stroke-width 0.3s'}}
          />
        )
      })}

      {/* Nodes */}
      {Object.entries(NODES).map(([id, pos]) => {
        const state = getNodeState(id, step, sp)
        const ns = NODE_STYLES[state]
        return (
          <g key={id} style={{filter: ns.glow, transition:'filter 0.3s'}}>
            {/* Outer glow ring for current node */}
            {state === 'current' && (
              <circle cx={pos.x} cy={pos.y} r={32}
                fill="rgba(196,169,107,0.15)"
                stroke="rgba(196,169,107,0.3)"
                strokeWidth={1}
              />
            )}
            {/* Main circle */}
            <circle
              cx={pos.x} cy={pos.y} r={24}
              fill={ns.fill}
              stroke={ns.stroke}
              strokeWidth={ns.strokeWidth}
              style={{transition:'fill 0.3s, stroke 0.3s'}}
            />
            {/* Node label */}
            <text
              x={pos.x} y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={ns.textFill}
              fontSize="15"
              fontWeight="700"
              fontFamily="'Space Mono', monospace"
              style={{transition:'fill 0.3s', userSelect:'none'}}
            >{id}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export default function GraphVisualiser() {
  const [algo, setAlgo]       = useState('dfs')
  const [steps, setSteps]     = useState([])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed]     = useState(5)
  const [startNode, setStartNode] = useState('A')
  const [endNode, setEndNode]     = useState('I')
  const [explain, setExplain] = useState('Select an algorithm and press <strong>Play</strong> to watch it traverse the graph node by node.')
  const timerRef = useRef(null)

  const init = useCallback((a = algo, s = startNode, e = endNode) => {
    clearInterval(timerRef.current); setPlaying(false)
    const s2 = a === 'dfs' ? generateDFSSteps(s) : generateBFSSteps(s, a === 'bfs' ? e : null)
    setSteps(s2); setStepIdx(0)
    setExplain(`Starting <span class="hl">${a.toUpperCase()}</span> from node <span class="pivot-hl">"${s}"</span>${a === 'bfs' ? ` searching for <span class="sorted-hl">"${e}"</span>` : ''}. Press <strong>Play</strong> or <strong>Step →</strong> to begin.`)
  }, [algo, startNode, endNode])

  useEffect(() => { init() }, [])

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
    const delay = Math.round(1200 - speed * 100)
    timerRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length) { clearInterval(timerRef.current); setPlaying(false); return prev }
        setExplain(steps[prev].explain)
        return prev + 1
      })
    }, delay)
  }

  function switchAlgo(a) { setAlgo(a); init(a, startNode, endNode) }

  const sp = currentStep?.shortestPath || (done && steps[steps.length-1]?.shortestPath) || []

  return (
    <div>
      <div className="algo-row">
        {['dfs','bfs'].map(a => (
          <button key={a} className={`algo-btn${algo === a ? ' active' : ''}`} onClick={() => switchAlgo(a)}>
            {a === 'dfs' ? 'Depth-First Search' : 'Breadth-First Search'}
          </button>
        ))}
      </div>

      <div className="badges">
        {[['Time','O(V + E)'],['Space','O(V)'],['Strategy', algo === 'dfs' ? 'Stack (LIFO)' : 'Queue (FIFO)']].map(([l,v]) => (
          <div key={l} className="badge">{l} <span>{v}</span></div>
        ))}
      </div>

      <Controls
        onPlay={play} onStep={step}
        onReset={() => init()} onRandomise={() => init()}
        playing={playing} stepDisabled={done}
        speed={speed} onSpeedChange={setSpeed}
        stepLabel={`Step ${stepIdx} / ${steps.length}`}
      />

      {/* Node selectors */}
      <div className="graph-config">
        <div className="target-row">
          <span className="target-label">Start node:</span>
          <select className="target-input" value={startNode} onChange={e => { setStartNode(e.target.value); init(algo, e.target.value, endNode) }}>
            {Object.keys(NODES).map(n => <option key={n}>{n}</option>)}
          </select>
          {algo === 'bfs' && <>
            <span className="target-label">Target node:</span>
            <select className="target-input" value={endNode} onChange={e => { setEndNode(e.target.value); init(algo, startNode, e.target.value) }}>
              {Object.keys(NODES).map(n => <option key={n}>{n}</option>)}
            </select>
          </>}
        </div>
      </div>

      {/* Legend */}
      <div className="legend" style={{marginTop: '12px'}}>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--surface2)',border:'1px solid var(--border)'}} />Unvisited</div>
        <div className="legend-item"><div className="legend-dot pivot" />Current node</div>
        <div className="legend-item"><div className="legend-dot sorted" />Visited</div>
        {algo === 'bfs' && <div className="legend-item"><div className="legend-dot found" />Shortest path</div>}
      </div>

      {/* Graph SVG */}
      <div className="graph-area">
        <GraphSVG step={currentStep} shortestPath={sp} />
      </div>

      {/* Queue / Stack state */}
      {currentStep && (
        <div className="graph-state">
          <span className="graph-state-label">{algo === 'dfs' ? 'Stack:' : 'Queue:'}</span>
          <div className="graph-state-items">
            {(algo === 'dfs' ? [...(currentStep.stack||[])].reverse() : currentStep.queue||[]).map((n,i) => (
              <span key={i} className="graph-state-node">{n}</span>
            ))}
            {!(algo === 'dfs' ? currentStep.stack : currentStep.queue)?.length && <span className="graph-state-empty">empty</span>}
          </div>
          <span className="graph-state-label" style={{marginLeft:'20px'}}>Visited:</span>
          <div className="graph-state-items">
            {(currentStep.visited||[]).map((n,i) => (
              <span key={i} className="graph-state-node visited">{n}</span>
            ))}
          </div>
        </div>
      )}

      <ExplainBox html={explain} />
      <PseudoCode lines={PSEUDO[algo]} activeLine={currentStep?.pl ?? -1} />
    </div>
  )
}
