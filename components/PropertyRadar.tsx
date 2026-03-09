import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { AlloyProperty } from '../types';

interface PropertyRadarProps {
  properties: AlloyProperty[];
}

const PropertyRadar: React.FC<PropertyRadarProps> = ({ properties }) => {
  const data = properties.map(p => ({
    subject: p.name,
    A: p.value,
    fullMark: 100,
    unit: p.unit,
    predicted: p.predictedValue
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 p-2 rounded shadow-lg text-xs">
          <p className="font-bold text-indigo-300">{label}</p>
          <p className="text-white">Score: {data.A}/100</p>
          <p className="text-slate-300">Est: {data.predicted}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Alloy Properties"
            dataKey="A"
            stroke="#6366f1"
            strokeWidth={2}
            fill="#6366f1"
            fillOpacity={0.3}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PropertyRadar;