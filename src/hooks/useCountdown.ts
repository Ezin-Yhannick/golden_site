import { useEffect, useState } from 'react'

interface TimeLeft {
  days: string
  hours: string
  minutes: string
  seconds: string
}

const pad = (n: number) => String(n).padStart(2, '0')

export function useCountdown(targetDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--',
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime()
      let diff = Math.max(0, targetDate.getTime() - now)

      const days = Math.floor(diff / 86400000)
      diff -= days * 86400000
      const hours = Math.floor(diff / 3600000)
      diff -= hours * 3600000
      const minutes = Math.floor(diff / 60000)
      diff -= minutes * 60000
      const seconds = Math.floor(diff / 1000)

      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}
