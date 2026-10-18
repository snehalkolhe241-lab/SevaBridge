import type { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={tone === 'neutral' ? 'badge' : `badge badge-${tone}`}>{children}</span>
}
