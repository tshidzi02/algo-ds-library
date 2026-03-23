export default function Controls({ onPlay, onStep, onReset, onRandomise, playing, stepDisabled, showSize = false, size, onSizeChange, speed, onSpeedChange, stepLabel }) {
  return (
    <div className="controls">
      <button className="btn primary" onClick={onPlay}>{playing ? '⏸ Pause' : '▶ Play'}</button>
      <button className="btn" onClick={onStep} disabled={stepDisabled}>Step →</button>
      <button className="btn" onClick={onReset}>↺ Reset</button>
      <button className="btn" onClick={onRandomise}>⚡ Randomise</button>
      {showSize && (
        <div className="slider-wrap">
          <span>Size</span>
          <input type="range" min={6} max={20} value={size} onChange={e => onSizeChange(Number(e.target.value))} />
          <span>{size}</span>
        </div>
      )}
      <div className="slider-wrap">
        <span>Speed</span>
        <input type="range" min={1} max={10} value={speed} onChange={e => onSpeedChange(Number(e.target.value))} />
      </div>
      {stepLabel && <span className="step-counter">{stepLabel}</span>}
    </div>
  )
}
