// frontend/src/components/Charts.tsx
import React from 'react';

export function BarChart({ data, xKey, yKey, color }) {
  const maxValue = Math.max(...data.map(d => d[yKey]));
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center">
          <span className="text-xs w-16 truncate">{item[xKey]}</span>
          <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(item[yKey] / maxValue) * 100}%`,
                backgroundColor: color
              }}
            ></div>
          </div>
          <span className="text-xs font-medium w-8 text-right">{item[yKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, yKey, color }) {
  return (
    <div className="h-40 flex items-end space-x-2">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-red-500"
            style={{
              height: `${(item[yKey] || 0.5) * 200}px`,
              backgroundColor: color
            }}
          ></div>
          <span className="text-xs mt-1 text-gray-600">{item.type}</span>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data, labelKey, valueKey, colors }) {
  let total = data.reduce((sum, d) => sum + d[valueKey], 0);
  let cumulative = 0;

  return (
    <div className="flex items-center space-x-6">
      <div className="relative w-32 h-32">
        {data.map((item, i) => {
          const start = cumulative / total;
          const end = (cumulative + item[valueKey]) / total;
          cumulative += item[valueKey];

          return (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                clipPath: `inset(0 0 0 0 round 50%)`,
                background: `conic-gradient(from ${start * 360}deg at 50% 50%, ${colors[i]} 0deg, transparent ${end * 360 - start * 360}deg)`
              }}
            ></div>
          );
        })}
      </div>
      <div className="space-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors[i] }}
            ></div>
            <span className="text-sm">
              {item[labelKey]}: {item[valueKey]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}