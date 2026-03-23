import { useState } from 'react'
import SortingVisualiser from './components/SortingVisualiser'
import BinarySearchVisualiser from './components/BinarySearchVisualiser'
import GraphVisualiser from './components/GraphVisualiser'
import DPVisualiser from './components/DPVisualiser'
import GreedyVisualiser from './components/GreedyVisualiser'

const TABS = [
  { id: 'sorting',   label: 'Sorting' },
  { id: 'searching', label: 'Binary Search' },
  { id: 'graphs',    label: 'Graphs' },
  { id: 'dp',        label: 'Dynamic Programming' },
  { id: 'greedy',    label: 'Greedy' },
]

export default function App() {
  const [tab, setTab] = useState('sorting')
  return (
    <div className="wrap">
      <header className="header">
        <div className="logo">algo<span>.</span>viz</div>
        <div className="tagline">Algorithm &amp; Data Structures Visualiser</div>
      </header>
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'sorting'   && <SortingVisualiser />}
      {tab === 'searching' && <BinarySearchVisualiser />}
      {tab === 'graphs'    && <GraphVisualiser />}
      {tab === 'dp'        && <DPVisualiser />}
      {tab === 'greedy'    && <GreedyVisualiser />}
    </div>
  )
}
