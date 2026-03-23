export default function PseudoCode({ lines, activeLine = -1 }) {
  return (
    <div className="pseudo-wrap">
      <div className="pseudo-title">Pseudocode — active line highlighted</div>
      {lines.map((line, i) => (
        <div key={i} className={`pseudo-line${i === activeLine ? ' active' : ''}`}>
          {line || '\u00A0'}
        </div>
      ))}
    </div>
  )
}
