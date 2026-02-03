import { useEffect, useState } from 'react';

interface TimerDisplayProps {
  startTime: Date;
  className?: string;
}

export function TimerDisplay({ startTime, className = '' }: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  return (
    <div className={`font-mono tabular-nums ${className}`}>
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

interface DurationDisplayProps {
  minutes: number;
  className?: string;
}

export function DurationDisplay({ minutes, className = '' }: DurationDisplayProps) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return (
    <div className={`font-mono tabular-nums ${className}`}>
      {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}
    </div>
  );
}
