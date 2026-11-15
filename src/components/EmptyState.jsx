import { Inbox } from 'lucide-react'

function EmptyState({ icon: Icon = Inbox, title = 'Belum ada data', message, children }) {
  return (
    <div className="state-box">
      <Icon className="state-box__icon" size={40} strokeWidth={1.8} aria-hidden="true" />
      <p className="state-box__title">{title}</p>
      {message && <p className="state-box__message">{message}</p>}
      {children}
    </div>
  )
}

export default EmptyState
