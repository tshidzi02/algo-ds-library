import React from 'react'
import { FREQ_COLOR } from '../utils'

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 18 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid #c8bfa8',
      borderTopColor: '#b89a3a',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  )
}

/* ── Loading state ───────────────────────────────────────── */
export function Loading({ text = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b6555', fontSize: 13, padding: '1.5rem 0' }}>
      <Spinner />
      {text}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Error box ───────────────────────────────────────────── */
export function ErrorBox({ message }) {
  return (
    <div style={{ color: '#8b2020', background: '#fdf0f0', padding: '0.75rem 1rem', borderLeft: '3px solid #8b2020', fontSize: 13, borderRadius: 2 }}>
      {message}
    </div>
  )
}

/* ── Card ────────────────────────────────────────────────── */
export function Card({ title, children, style }) {
  return (
    <div style={{
      background: 'white', border: '1.5px solid #c8bfa8',
      borderRadius: 2, padding: '1.5rem',
      boxShadow: '3px 3px 0 #c8bfa8',
      marginBottom: '1.5rem', ...style,
    }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6555', marginBottom: '1rem' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Stat card ───────────────────────────────────────────── */
const STAT_STYLES = {
  'inc-p':  { bg: '#edf7f0', border: '#2a5c3a', color: '#2a5c3a' },
  'inc-a':  { bg: '#fffae6', border: '#b89a3a', color: '#a07a00' },
  'exp':    { bg: '#fdf0f0', border: '#8b2020', color: '#8b2020' },
  'net':    { bg: '#f3eefb', border: '#4a1a6e', color: '#4a1a6e' },
  'bal':    { bg: '#fff4e8', border: '#b85a10', color: '#b85a10' },
}

export function StatCard({ label, value, variant }) {
  const s = STAT_STYLES[variant] || STAT_STYLES['bal']
  return (
    <div style={{ background: s.bg, borderLeft: `4px solid ${s.border}`, padding: '1.1rem 1.3rem', borderRadius: 2 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b6555', marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{value}</div>
    </div>
  )
}

/* ── Badge / Tag ─────────────────────────────────────────── */
export function Badge({ label, variant }) {
  const s = FREQ_COLOR[label] || FREQ_COLOR['Once-off']
  const custom = variant === 'income'
    ? { bg: '#edf7f0', color: '#2a5c3a' }
    : variant === 'expense'
      ? { bg: '#fdf0f0', color: '#8b2020' }
      : null
  const { bg, color } = custom || s
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 2,
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: '0.04em', background: bg, color,
    }}>
      {label}
    </span>
  )
}

/* ── Button ──────────────────────────────────────────────── */
export function Button({ children, onClick, variant = 'primary', disabled, style, type = 'button' }) {
  const styles = {
    primary: { bg: '#0f0e0a', color: '#f5f0e8', border: '#0f0e0a' },
    secondary: { bg: 'white', color: '#0f0e0a', border: '#0f0e0a' },
    danger: { bg: '#8b2020', color: 'white', border: '#8b2020' },
    ghost: { bg: 'transparent', color: '#6b6555', border: '#c8bfa8' },
  }
  const s = styles[variant] || styles.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600,
        padding: '0.5rem 1.1rem', border: `2px solid ${s.border}`,
        borderRadius: 2, background: s.bg, color: s.color,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s', ...style,
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.background = '#b89a3a'
        e.currentTarget.style.borderColor = '#b89a3a'
        e.currentTarget.style.color = '#0f0e0a'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = s.bg
        e.currentTarget.style.borderColor = s.border
        e.currentTarget.style.color = s.color
      }}
    >
      {children}
    </button>
  )
}

/* ── Field ───────────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6555' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  fontFamily: "'DM Mono', monospace", fontSize: 13,
  padding: '0.45rem 0.7rem', border: '1.5px solid #c8bfa8',
  borderRadius: 2, background: 'white', color: '#0f0e0a', width: '100%',
}

export function Input({ ...props }) {
  return <input style={inputStyle} {...props} />
}

export function Select({ children, ...props }) {
  return <select style={inputStyle} {...props}>{children}</select>
}

/* ── Table ───────────────────────────────────────────────── */
export function Table({ headers, children, emptyMessage = 'No data.' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                fontWeight: 600, color: '#6b6555', padding: '0.6rem 0.9rem',
                borderBottom: '2px solid #c8bfa8', textAlign: h.right ? 'right' : 'left',
                background: '#ede8da', whiteSpace: 'nowrap',
              }}>
                {h.label || h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }) {
  const [hover, setHover] = React.useState(false)
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? '#ede8da' : 'transparent', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
    >
      {children}
    </tr>
  )
}

export function Td({ children, right, style }) {
  return (
    <td style={{ padding: '0.6rem 0.9rem', borderBottom: '1px solid #e8e2d6', textAlign: right ? 'right' : 'left', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  )
}

/* ── Modal ───────────────────────────────────────────────── */
export function Modal({ open, title, onClose, children, width = 520 }) {
  if (!open) return null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,14,10,0.6)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: '#f5f0e8', border: '2px solid #0f0e0a',
        borderRadius: 2, padding: '2rem', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '6px 6px 0 #0f0e0a',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', paddingBottom: '0.75rem', borderBottom: '2px solid #c8bfa8' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b6555', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Notification toast ──────────────────────────────────── */
export function Notification({ notif }) {
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      background: '#0f0e0a', color: '#f5f0e8',
      padding: '0.75rem 1.3rem', borderLeft: '4px solid #b89a3a',
      borderRadius: 2, fontSize: 13, boxShadow: '4px 4px 0 #c8bfa8',
      zIndex: 300, transition: 'all 0.22s',
      opacity: notif ? 1 : 0, transform: notif ? 'translateY(0)' : 'translateY(8px)',
      pointerEvents: 'none', maxWidth: 320,
    }}>
      {notif?.msg}
    </div>
  )
}

/* ── Section title ───────────────────────────────────────── */
export function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', fontWeight: 700,
      marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #c8bfa8',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
    }}>
      {children}
    </h2>
  )
}

export function Accent({ children }) {
  return <span style={{ color: '#b89a3a' }}>{children}</span>
}

/* ── Form row ────────────────────────────────────────────── */
export function FormRow({ children, cols = 'repeat(auto-fill, minmax(180px, 1fr))' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '0.9rem', marginBottom: '0.9rem' }}>
      {children}
    </div>
  )
}
