import React, { useState, useRef, useMemo } from 'react';
import { StarIcon, ForkIcon } from './icons';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

interface PieChartProps {
  data: { name: string; count: number }[];
}

export const LanguagePieChart: React.FC<PieChartProps> = ({ data }) => {
  const [hoveredSlice, setHoveredSlice] = useState<{ name: string; count: number; percent: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark py-12">No language data to display.</p>;
  
  const center = 50;
  const radius = 45;
  const holeRadius = 25;
  let cumulativeAngle = -Math.PI / 2; // Start from top

  const slices = data.map((item, index) => {
    const percent = item.count / total;
    const angle = percent * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startPoint = {
      x: center + radius * Math.cos(startAngle),
      y: center + radius * Math.sin(startAngle),
    };
    const endPoint = {
      x: center + radius * Math.cos(endAngle),
      y: center + radius * Math.sin(endAngle),
    };

    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    // Path for a donut slice
    const pathData = [
      `M ${center + holeRadius * Math.cos(startAngle)},${center + holeRadius * Math.sin(startAngle)}`,
      `L ${startPoint.x},${startPoint.y}`,
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endPoint.x},${endPoint.y}`,
      `L ${center + holeRadius * Math.cos(endAngle)},${center + holeRadius * Math.sin(endAngle)}`,
      `A ${holeRadius},${holeRadius} 0 ${largeArcFlag} 0 ${center + holeRadius * Math.cos(startAngle)},${center + holeRadius * Math.sin(startAngle)}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      pathData,
      color: COLORS[index % COLORS.length],
      percent: (percent * 100).toFixed(1)
    };
  });

  const handleMouseMove = (e: React.MouseEvent, slice: (typeof slices)[0]) => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setHoveredSlice({
              name: slice.name,
              count: slice.count,
              percent: slice.percent,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
          });
      }
  };

  return (
    <div ref={containerRef} className="relative h-72 w-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-xs" onMouseLeave={() => setHoveredSlice(null)}>
        <g>
          {slices.map((slice) => (
            <path
              key={slice.name}
              d={slice.pathData}
              fill={slice.color}
              strokeWidth="2"
              className="stroke-surface dark:stroke-surface-dark transition-transform duration-200 cursor-pointer"
              onMouseMove={(e) => handleMouseMove(e, slice)}
              style={{
                transformOrigin: '50% 50%',
                transform: hoveredSlice?.name === slice.name ? 'scale(1.03)' : 'scale(1)',
              }}
            />
          ))}
        </g>
      </svg>
      {hoveredSlice && (
        <div 
          className="absolute p-2 text-xs bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark rounded-md shadow-lg pointer-events-none border border-black/10 dark:border-white/10"
          style={{ 
            left: `${hoveredSlice.x}px`, 
            top: `${hoveredSlice.y}px`, 
            transform: 'translate(15px, -50%)',
          }}
        >
          <p className="font-bold">{hoveredSlice.name}</p>
          <p>{hoveredSlice.count} repositories ({hoveredSlice.percent}%)</p>
        </div>
      )}
    </div>
  );
};

interface BarChartProps {
    data: { name: string; stars: number; forks: number }[];
}

export const RepoBarChart: React.FC<BarChartProps> = ({ data }) => {
    const [hoveredBar, setHoveredBar] = useState<{ name: string; stars: number; forks: number; x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    if (data.length === 0 || data.every(d => d.stars === 0)) {
        return <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark py-8">No repository star data to display.</p>;
    }
    
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.stars)) : 0;
    const topTick = Math.ceil(maxValue / 100) * 100;

    const containerHeight = 250;
    const svgWidth = 500;
    const yAxisWidth = 40;
    const xAxisHeight = 60;
    const paddingTop = 20;
    const chartHeight = containerHeight - xAxisHeight - paddingTop;

    const numTicks = 3;
    const yTicks = Array.from({ length: numTicks + 1 }, (_, i) => {
        const value = Math.round((topTick / numTicks) * i);
        return {
            value,
            y: chartHeight - (value / topTick) * chartHeight
        };
    });

    const handleMouseMove = (e: React.MouseEvent, item: { name: string, stars: number, forks: number }) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setHoveredBar({ ...item, x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    return (
        <div ref={containerRef} className="relative h-64 w-full" onMouseLeave={() => setHoveredBar(null)}>
            <svg width="100%" height={containerHeight} viewBox={`0 0 ${svgWidth} ${containerHeight}`}>
                <g className="text-xs fill-text-secondary dark:fill-text-secondary-dark">
                    {yTicks.map(tick => (
                        <g key={tick.value}>
                            <line
                                x1={yAxisWidth} y1={tick.y + paddingTop}
                                x2={svgWidth} y2={tick.y + paddingTop}
                                className="stroke-black/10 dark:stroke-white/10" strokeDasharray="2,2"
                            />
                            <text x={yAxisWidth - 8} y={tick.y + 4 + paddingTop} textAnchor="end">
                                {tick.value}
                            </text>
                        </g>
                    ))}
                </g>

                <g>
                    {data.map((item, index) => {
                        const barWidth = (svgWidth - yAxisWidth) / data.length * 0.6;
                        const barSpacing = (svgWidth - yAxisWidth) / data.length * 0.4;
                        const barHeight = item.stars > 0 ? (item.stars / topTick) * chartHeight : 0;
                        const x = yAxisWidth + index * (barWidth + barSpacing) + (barSpacing/2);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={item.name} className="cursor-pointer" onMouseMove={(e) => handleMouseMove(e, item)}>
                                <rect x={x} y={paddingTop} width={barWidth} height={chartHeight} rx="4" className="fill-black/5 dark:fill-white/5" />
                                <rect x={x} y={y + paddingTop} width={barWidth} height={barHeight} rx="4" className="fill-brand-purple transition-opacity" opacity={hoveredBar?.name === item.name ? 1 : 0.8} />
                            </g>
                        );
                    })}
                </g>
                <g className="text-xs fill-text-secondary dark:fill-text-secondary-dark">
                   {data.map((item, index) => {
                       const barWidth = (svgWidth - yAxisWidth) / data.length * 0.6;
                       const barSpacing = (svgWidth - yAxisWidth) / data.length * 0.4;
                       const x = yAxisWidth + index * (barWidth + barSpacing) + (barSpacing/2) + barWidth / 2;
                       const y = containerHeight - xAxisHeight + 15;
                        return (
                           <text key={`label-${item.name}`} x={x} y={y} textAnchor="end" transform={`rotate(-45 ${x} ${y})`}>
                               {item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name}
                           </text>
                        );
                   })}
                </g>
            </svg>
            {hoveredBar && (
                 <div 
                    className="absolute p-2.5 text-xs bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark rounded-lg shadow-lg pointer-events-none border border-black/10 dark:border-white/10"
                    style={{
                      left: `${hoveredBar.x}px`,
                      top: `${hoveredBar.y}px`,
                      transform: 'translate(-50%, -110%)',
                    }}
                 >
                    <p className="font-bold text-base mb-1">{hoveredBar.name}</p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400" /> {hoveredBar.stars.toLocaleString()}</div>
                        <div className="flex items-center gap-1"><ForkIcon className="w-4 h-4 text-fuchsia-400" /> {hoveredBar.forks.toLocaleString()}</div>
                    </div>
                 </div>
            )}
        </div>
    );
};

interface LineChartProps {
    data: { year: number; count: number }[];
}

export const ActivityLineChart: React.FC<LineChartProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<{ year: number; count: number; x: number; y: number } | null>(null);

    if (data.length < 2) {
        return <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark py-12">Not enough data for a timeline.</p>;
    }

    const containerHeight = 288; // h-72
    const svgWidth = 500;
    const yAxisWidth = 40;
    const xAxisHeight = 20;
    const paddingTop = 10;
    const paddingRight = 10;
    const chartHeight = containerHeight - xAxisHeight - paddingTop;
    const chartWidth = svgWidth - yAxisWidth - paddingRight;

    const maxCount = Math.max(...data.map(d => d.count));
    const minYear = Math.min(...data.map(d => d.year));
    const maxYear = Math.max(...data.map(d => d.year));
    const yearRange = maxYear - minYear;

    const points = useMemo(() => data.map(item => ({
        x: yAxisWidth + ((item.year - minYear) / yearRange) * chartWidth,
        y: paddingTop + chartHeight - (item.count / maxCount) * chartHeight
    })), [data, yAxisWidth, minYear, yearRange, chartWidth, paddingTop, chartHeight, maxCount]);
    
    const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const svgX = (e.clientX - rect.left) / rect.width * svgWidth;
        
        // Find the closest point
        let closestPointIndex = -1;
        let minDistance = Infinity;

        points.forEach((point, index) => {
            const distance = Math.abs(point.x - svgX);
            if (distance < minDistance) {
                minDistance = distance;
                closestPointIndex = index;
            }
        });
        
        if (closestPointIndex !== -1 && minDistance < 20) { // Threshold to activate tooltip
            setHoveredPoint({
                ...data[closestPointIndex],
                x: (points[closestPointIndex].x / svgWidth) * rect.width,
                y: (points[closestPointIndex].y / containerHeight) * rect.height,
            });
        } else {
            setHoveredPoint(null);
        }
    };

    return (
        <div ref={containerRef} className="relative h-72 w-full" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredPoint(null)}>
            <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${containerHeight}`}>
                {/* Y-axis */}
                <text x={yAxisWidth - 8} y={paddingTop + 4} textAnchor="end" className="text-xs fill-text-secondary dark:fill-text-secondary-dark">{maxCount}</text>
                <text x={yAxisWidth - 8} y={containerHeight - xAxisHeight} textAnchor="end" className="text-xs fill-text-secondary dark:fill-text-secondary-dark">0</text>
                
                {/* X-axis */}
                <text x={yAxisWidth} y={containerHeight} textAnchor="start" className="text-xs fill-text-secondary dark:fill-text-secondary-dark">{minYear}</text>
                <text x={svgWidth - paddingRight} y={containerHeight} textAnchor="end" className="text-xs fill-text-secondary dark:fill-text-secondary-dark">{maxYear}</text>

                {/* Gradient */}
                <defs>
                    <linearGradient id="line-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand-purple)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-brand-purple)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <path d={`${pathData} L ${points[points.length - 1].x} ${chartHeight + paddingTop} L ${points[0].x} ${chartHeight + paddingTop} Z`} fill="url(#line-chart-gradient)" />
                
                {/* Line */}
                <path d={pathData} fill="none" strokeWidth="2" className="stroke-brand-purple" />
                
                {/* Points */}
                {points.map((point, index) => (
                    <circle key={index} cx={point.x} cy={point.y} r="3" className="fill-brand-purple" />
                ))}
            </svg>
            {hoveredPoint && (
                <div 
                    className="absolute p-2 text-xs bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark rounded-md shadow-lg pointer-events-none border border-black/10 dark:border-white/10 text-center"
                    style={{ 
                        left: `${hoveredPoint.x}px`, 
                        top: `${hoveredPoint.y}px`, 
                        transform: 'translate(-50%, -120%)',
                    }}
                >
                    <p className="font-bold">{hoveredPoint.year}</p>
                    <p>{hoveredPoint.count} repos</p>
                </div>
            )}
        </div>
    );
};