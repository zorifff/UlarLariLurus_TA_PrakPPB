function LoadingState({ message = 'Memuat…' }) {
  return (
    <div className="state-box state-box--plain" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="state-box__message">{message}</p>
    </div>
  )
}

export default LoadingState
