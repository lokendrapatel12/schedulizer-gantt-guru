
import React, { useMemo } from 'react';
import { GanttProcess } from '../utils/types';

interface GanttChartProps {
  processes: GanttProcess[];
}

const GanttChart: React.FC<GanttChartProps> = ({ processes }) => {
  // Find min and max times for the chart
  const timeRange = useMemo(() => {
    if (processes.length === 0) return { min: 0, max: 10 };
    
    const min = Math.min(...processes.map(p => p.start));
    const max = Math.max(...processes.map(p => p.end));
    
    return { min, max };
  }, [processes]);
  
  // Calculate the total time span
  const totalTimeSpan = timeRange.max - timeRange.min;
  
  // Create time markers
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = Math.ceil(totalTimeSpan / 10) || 1; // Ensure at least 1
    
    for (let i = timeRange.min; i <= timeRange.max; i += step) {
      markers.push(i);
    }
    
    // Always include the max time
    if (!markers.includes(timeRange.max)) {
      markers.push(timeRange.max);
    }
    
    return markers;
  }, [timeRange, totalTimeSpan]);
  
  // Group consecutive segments for the same process
  const mergedProcesses = useMemo(() => {
    if (processes.length === 0) return [];
    
    const sorted = [...processes].sort((a, b) => a.start - b.start);
    const merged: GanttProcess[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const lastMerged = merged[merged.length - 1];
      const current = sorted[i];
      
      if (current.id === lastMerged.id && current.start === lastMerged.end) {
        // Merge with the previous segment
        lastMerged.end = current.end;
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }, [processes]);
  
  // Get unique process IDs to assign colors
  const processIds = useMemo(() => {
    const ids = Array.from(new Set(processes.map(p => p.id)));
    return ids;
  }, [processes]);
  
  // Get color for a process ID
  const getProcessColor = (id: string) => {
    const index = processIds.indexOf(id);
    return `process-color-${(index % 10) + 1}`;
  };
  
  if (processes.length === 0) {
    return (
      <div className="p-4 border rounded bg-muted text-center">
        No processes to display. Please run a scheduling algorithm.
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded bg-card shadow-sm">
      <h3 className="text-lg font-medium mb-4">Gantt Chart</h3>
      
      <div className="relative h-12 w-full">
        {/* Process blocks */}
        {mergedProcesses.map((process, index) => {
          const startPercent = ((process.start - timeRange.min) / totalTimeSpan) * 100;
          const widthPercent = ((process.end - process.start) / totalTimeSpan) * 100;
          
          return (
            <div
              key={`${process.id}-${index}`}
              className={`absolute h-12 flex items-center justify-center text-white text-sm font-medium rounded-sm ${getProcessColor(process.id)}`}
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                minWidth: "20px",
              }}
              title={`${process.id} (${process.start} - ${process.end})`}
            >
              {widthPercent > 5 ? process.id : ""}
            </div>
          );
        })}
      </div>
      
      {/* Time markers */}
      <div className="relative h-6 w-full mt-2 border-t">
        {timeMarkers.map((time, index) => {
          const position = ((time - timeRange.min) / totalTimeSpan) * 100;
          
          return (
            <div 
              key={`marker-${index}`}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${position}%` }}
            >
              <div className="h-2 border-l"></div>
              <div className="text-xs text-muted-foreground">
                {time}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        {processIds.map((id, index) => (
          <div key={`legend-${id}`} className="flex items-center">
            <div 
              className={`w-4 h-4 mr-2 rounded-sm ${getProcessColor(id)}`}
            ></div>
            <span className="text-sm">{id}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
