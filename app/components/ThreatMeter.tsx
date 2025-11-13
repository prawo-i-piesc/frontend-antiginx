"use client";

import { useEffect, useState } from 'react';

interface ThreatMeterProps {
  threatLevel: number;
}

export default function ThreatMeter({ threatLevel }: ThreatMeterProps) {
  const [animatedLevel, setAnimatedLevel] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedLevel(threatLevel);
    }, 300);
    return () => clearTimeout(timer);
  }, [threatLevel]);

  const getColor = (level: number) => {
    if (level < 30) return '#10B981';
    if (level < 70) return '#F59E0B';
    return '#EF4444';
  };

  const getGradientColor = (level: number) => {
    if (level < 30) return 'from-green-400 to-green-600';
    if (level < 70) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  const getText = (level: number) => {
    if (level < 30) return 'Bezpieczne';
    if (level < 70) return 'Ostrożnie';
    return 'Niebezpieczne';
  };

  const radius = 120;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedLevel / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle stroke="#374151" fill="transparent" strokeWidth={strokeWidth} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke={getColor(threatLevel)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.5s ease-in-out, stroke 0.5s ease',
              filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold bg-linear-to-br ${getGradientColor(threatLevel)} bg-clip-text text-transparent`}>
            {Math.round(animatedLevel)}%
          </div>
          <div className="text-gray-300 font-semibold text-lg mt-2">{getText(threatLevel)}</div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
          <span className="text-sm font-medium text-gray-300">0-29% Bezpieczne</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg"></div>
          <span className="text-sm font-medium text-gray-300">30-69% Średnie</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
          <span className="text-sm font-medium text-gray-300">70-100% Wysokie</span>
        </div>
      </div>
    </div>
  );
}
