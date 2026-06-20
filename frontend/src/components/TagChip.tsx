import { Link } from 'react-router-dom'

// One tag chip used identically across Show, Review, and Tags. It renders as a
// toggle button (onClick) or a navigation link (to) — same pill either way, so
// the same concept finally looks the same everywhere.
type Common = {
  label: string
  active?: boolean
  count?: number
}

type AsButton = Common & { onClick: () => void; to?: never }
type AsLink = Common & { to: string; onClick?: never }

const base =
  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-medium transition select-none'

const variant = (active?: boolean) =>
  active
    ? 'border-brand bg-brand text-white hover:bg-brand-hover'
    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'

export default function TagChip(props: AsButton | AsLink) {
  const { label, active, count } = props
  const className = `${base} ${variant(active)}`

  const inner = (
    <>
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-xs ${
            active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {count}
        </span>
      )}
    </>
  )

  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={props.onClick} className={className}>
      {inner}
    </button>
  )
}
