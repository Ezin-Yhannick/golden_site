import { useCountdown } from '../hooks/useCountdown'

interface CountdownProps {
  targetDate: Date
}

export default function Countdown({ targetDate }: CountdownProps) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate)
  const units = [
    { value: days, label: 'Jours' },
    { value: hours, label: 'Heures' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Secondes' },
  ]

  return (
    <div>
      <p className="text-sm mb-5">L'offre se termine dans</p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {units.map((unit) => (
          <div key={unit.label} className="border border-line text-center py-4">
            <div className="font-display font-semibold text-2xl">{unit.value}</div>
            <div className="eyebrow text-[10px] mt-1">{unit.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        Le compteur indique la période promotionnelle actuellement affichée.
      </p>
    </div>
  )
}
