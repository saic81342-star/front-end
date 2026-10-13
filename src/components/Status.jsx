export function Loading({ text = 'Loading…' }) {
  return (
    <div className="state">
      <span className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function SuccessBox({ message }) {
  if (!message) return null
  return (
    <div className="alert alert-success" role="status">
      {message}
    </div>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <div className="empty-body">{children}</div>}
    </div>
  )
}
