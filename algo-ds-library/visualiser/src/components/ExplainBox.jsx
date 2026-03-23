export default function ExplainBox({ html }) {
  return (
    <div className="explain-box">
      <div className="explain-title">What's happening — step by step</div>
      <div className="explain-text" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
