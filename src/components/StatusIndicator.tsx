'use client'

interface StatusIndicatorProps {
  status: string
  count?: number
}

export default function StatusIndicator({ status, count }: StatusIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'working':
        return { icon: '✅', label: 'Working', color: 'text-green-600' }
      case 'failed':
        return { icon: '❌', label: 'Failed', color: 'text-red-600' }
      case 'restricted':
        return { icon: '🔒', label: 'Restricted', color: 'text-yellow-600' }
      default:
        return { icon: '❓', label: status, color: 'text-gray-600' }
    }
  }

  const { icon, label, color } = getStatusDisplay()

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <span>{icon}</span>
      <span className="text-xs">
        {count !== undefined ? `${count} ${label}` : label}
      </span>
    </div>
  )
}