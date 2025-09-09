import { useEffect, useState } from 'react';

interface CircleTimerProps {
  duration: number;
  size?: number;
  strokeWidth?: number;
  onComplete?: () => void;
}

export function CircleTimer({ 
  duration, 
  size = 200, 
  strokeWidth = 8,
  onComplete 
}: CircleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);

  // Cirkel berekeningen
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((duration - timeLeft) / duration) * circumference;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Achtergrond cirkel */}
        <svg className="absolute" width={size} height={size}>
          <circle
            className="text-gray-200"
            stroke="currentColor"
            fill="none"
            strokeWidth={strokeWidth}
            r={radius}
            cx={center}
            cy={center}
          />
        </svg>
        
        {/* Progress cirkel */}
        <svg 
          className="absolute -rotate-90" 
          width={size} 
          height={size}
        >
          <circle
            className="text-blue-600 transition-all duration-1000"
            stroke="currentColor"
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={radius}
            cx={center}
            cy={center}
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold">
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {!isActive ? (
          <button
            onClick={startTimer}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {timeLeft === duration ? "Start" : "Hervatten"}
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Pauze
          </button>
        )}
        
        {timeLeft !== duration && (
          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
