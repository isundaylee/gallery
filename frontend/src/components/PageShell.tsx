import type { ReactNode } from 'react'

// The single page container used by every screen: shared max-width, padding,
// and a consistent title treatment. Replaces the four bespoke containers.
export default function PageShell({
  title,
  actions,
  children,
}: {
  title?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {(title || actions) && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
          )}
          {actions}
        </div>
      )}
      {children}
    </main>
  )
}
