
import React from 'react';
import { Process, ProcessResult } from '../utils/types';
import GanttChart from './GanttChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResultsPanelProps {
  results: ProcessResult | null;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Select an algorithm and enter process details to see results here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { processes, ganttChart, averageTurnaroundTime, averageWaitingTime } = results;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <GanttChart processes={ganttChart} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Process Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process ID</TableHead>
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Burst Time</TableHead>
                  {processes[0]?.priority !== undefined && (
                    <TableHead>Priority</TableHead>
                  )}
                  <TableHead>Start Time</TableHead>
                  <TableHead>Finish Time</TableHead>
                  <TableHead>Turnaround Time</TableHead>
                  <TableHead>Waiting Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.id}</TableCell>
                    <TableCell>{process.arrivalTime}</TableCell>
                    <TableCell>{process.burstTime}</TableCell>
                    {processes[0]?.priority !== undefined && (
                      <TableCell>{process.priority}</TableCell>
                    )}
                    <TableCell>{process.startTime}</TableCell>
                    <TableCell>{process.finishTime}</TableCell>
                    <TableCell>{process.turnaroundTime}</TableCell>
                    <TableCell>{process.waitingTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">Average Turnaround Time</div>
              <div className="text-2xl font-bold">{averageTurnaroundTime.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">Average Waiting Time</div>
              <div className="text-2xl font-bold">{averageWaitingTime.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPanel;
