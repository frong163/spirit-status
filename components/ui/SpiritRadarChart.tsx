'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { UserAttributes } from '@/types';
import { ATTR_CONFIG } from '@/lib/game';

interface SpiritRadarChartProps {
  attributes: UserAttributes;
  size?: number;
}

export default function SpiritRadarChart({ attributes, size = 280 }: SpiritRadarChartProps) {
  const data = [
    { attribute: '🍀 Luck', value: attributes.luck, fullMark: 100 },
    { attribute: '⚡ Energy', value: attributes.energy, fullMark: 100 },
    { attribute: '💼 Career', value: attributes.career, fullMark: 100 },
    { attribute: '💰 Wealth', value: attributes.wealth, fullMark: 100 },
    { attribute: '❤️ Love', value: attributes.love, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(123,47,190,0.3)" />
        <PolarAngleAxis
          dataKey="attribute"
          tick={{ fill: '#E8D5A3', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(26,15,60,0.95)',
            border: '1px solid rgba(123,47,190,0.5)',
            borderRadius: '8px',
            color: '#E8D5A3',
            fontFamily: 'JetBrains Mono',
          }}
          formatter={(value) => [Number(value), 'Score']}
        />
        <Radar
          name="Spirit"
          dataKey="value"
          stroke="#C9A84C"
          fill="#7B2FBE"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
