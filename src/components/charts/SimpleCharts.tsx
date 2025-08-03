import React from 'react';

interface SimpleBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title: string;
  maxValue?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, title, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${
                    item.color || 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {typeof item.value === 'number' && item.value >= 1000 
                    ? `$${(item.value / 1000).toFixed(1)}k` 
                    : item.value.toLocaleString()
                  }
                </div>
              </div>
            </div>
            <div className="w-20 text-right text-sm font-medium text-gray-900">
              {typeof item.value === 'number' && item.value >= 1000 
                ? `$${item.value.toLocaleString()}` 
                : item.value.toLocaleString()
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SimpleLineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  title: string;
  color?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, title, color = 'blue' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // Generate SVG path for line
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const width = 400;
    const height = 200;
    const padding = 20;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <svg width="100%" height="200" viewBox="0 0 400 200" className="border rounded">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Data line */}
          <path
            d={generatePath()}
            fill="none"
            stroke={color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#8b5cf6'}
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = 20 + (index / (data.length - 1)) * 360;
            const y = 180 - ((point.value - minValue) / (maxValue - minValue)) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#8b5cf6'}
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`${point.date}: ${point.value.toLocaleString()}`}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* Data labels */}
        <div className="mt-4 flex justify-between text-xs text-gray-600">
          {data.map((point, index) => (
            <span key={index} className={index % 2 === 0 ? '' : 'opacity-0'}>
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface SimplePieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title: string;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const slices = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return { ...item, percentage, angle, startAngle };
  });

  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center">
        <div className="w-64 h-64">
          <svg width="250" height="250" viewBox="0 0 250 250">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={createArcPath(125, 125, 100, slice.startAngle, slice.startAngle + slice.angle)}
                fill={slice.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${slice.label}: ${slice.value.toLocaleString()} (${slice.percentage.toFixed(1)}%)`}</title>
              </path>
            ))}
          </svg>
        </div>
        <div className="ml-6 space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{slice.label}</div>
                <div className="text-xs text-gray-600">
                  {slice.value.toLocaleString()} ({slice.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
