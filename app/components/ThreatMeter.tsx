"use client";

import { useEffect, useState } from 'react';

import { useI18n } from '@/app/i18n/I18nProvider';

interface ThreatMeterProps {
  threatLevel: number;
}

export default function ThreatMeter({ threatLevel }: ThreatMeterProps) {
  const { t } = useI18n();
  const copy = t.landing.threatMeter;
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

  const getVerdict = (level: number) => {
    if (level < 30) return copy.verdicts.safe;
    if (level < 70) return copy.verdicts.caution;
    return copy.verdicts.danger;
  };

  const radius = 120;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedLevel / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* One image for assistive technology: the count-up and the ring are only visual. */}
      <div className="relative" role="img" aria-label={copy.label(Math.round(threatLevel), getVerdict(threatLevel))}>
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
          <div className="text-gray-300 font-semibold text-lg mt-2">{getVerdict(threatLevel)}</div>
        </div>
      </div>

      <ul className="mt-8 flex items-center justify-center space-x-8">
        <li className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-green-500 rounded-full shadow-lg" aria-hidden="true"></span>
          <span className="text-sm font-medium text-gray-300">{copy.legend.low}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg" aria-hidden="true"></span>
          <span className="text-sm font-medium text-gray-300">{copy.legend.medium}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-red-500 rounded-full shadow-lg" aria-hidden="true"></span>
          <span className="text-sm font-medium text-gray-300">{copy.legend.high}</span>
        </li>
      </ul>
    </div>
  );
}
