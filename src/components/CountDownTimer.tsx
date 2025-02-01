import { Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  seconds: number
  onComplete: () => void
}

const CountDownTimer: React.FC<CountdownTimerProps> = ({ seconds, onComplete }) => {
  const [countdown, setCountdown] = useState(seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1)
    }, 1000)

    if (countdown === 0) {
      clearInterval(interval)
      onComplete()
    }

    return () => clearInterval(interval)
  }, [countdown, onComplete])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (time % 60).toString().padStart(2, '0')

    return `${minutes}:${seconds}`
  }

  return <Typography color='primary'>{formatTime(countdown)}</Typography>
}

export default CountDownTimer
