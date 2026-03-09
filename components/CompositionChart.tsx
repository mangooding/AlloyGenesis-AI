import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ElementComposition } from '../types';
import { COLORS } from '../constants';

interface CompositionChartProps {
  composition: ElementComposition[];
}

const CompositionChart: React.FC<CompositionChartProps> = ({ composition }) => {
  const data = composition.map((item) => ({
    name: item.element,
    value: item.percentage,
    role: item.role
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-white">{data.name}: {data.value}%</p>
          <p className="text-xs text-slate-300 mt-1 italic">{data.role}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.chartColors[index % COLORS.chartColors.length]} stroke="rgba(0,0,0,0)" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-slate-300 ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompositionChart;