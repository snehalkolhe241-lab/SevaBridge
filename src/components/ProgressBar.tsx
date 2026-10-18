export function ProgressBar({ label, value }: { label: string; value: number }) {
  const width = Math.min(100, Math.max(0, value))
  return (
    <div className="progress">
      <div className="progress-label">
        <span>{label}</span>
        <span>{Math.round(width)}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(width)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
