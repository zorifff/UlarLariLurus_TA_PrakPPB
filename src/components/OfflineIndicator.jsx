import { WifiOff } from 'lucide-react'
import useOnlineStatus from '../hooks/useOnlineStatus.js'

function OfflineIndicator() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div className="offline-pill" role="status">
      <WifiOff size={14} aria-hidden="true" />
      Offline
    </div>
  )
}

export default OfflineIndicator
