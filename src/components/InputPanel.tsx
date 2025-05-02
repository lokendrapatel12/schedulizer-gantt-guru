
import React, { useState } from 'react';
import { Process, SchedulingAlgorithm } from '../utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface InputPanelProps {
  onRunAlgorithm: (algorithm: SchedulingAlgorithm, processes: Process[], timeQuantum?: number) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onRunAlgorithm }) => {
  const { toast } = useToast();
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>(SchedulingAlgorithm.FCFS);
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 2 },
    { id: 'P4', arrivalTime: 3, burstTime: 2, priority: 4 },
  ]);
  
  const handleAddProcess = () => {
    const newId = `P${processes.length + 1}`;
    setProcesses([
      ...processes,
      { id: newId, arrivalTime: 0, burstTime: 1, priority: 1 },
    ]);
  };
  
  const handleRemoveProcess = (index: number) => {
    if (processes.length <= 1) {
      toast({
        title: 'Cannot Remove Process',
        description: 'You must have at least one process.',
        variant: 'destructive',
      });
      return;
    }
    
    const newProcesses = [...processes];
    newProcesses.splice(index, 1);
    
    // Rename process IDs
    const renamedProcesses = newProcesses.map((proc, idx) => ({
      ...proc,
      id: `P${idx + 1}`,
    }));
    
    setProcesses(renamedProcesses);
  };
  
  const handleProcessChange = (index: number, key: keyof Process, value: number) => {
    const newProcesses = [...processes];
    newProcesses[index] = {
      ...newProcesses[index],
      [key]: value,
    };
    setProcesses(newProcesses);
  };
  
  const handleRunAlgorithm = () => {
    try {
      // Validate input
      for (const process of processes) {
        if (process.arrivalTime < 0 || process.burstTime <= 0) {
          toast({
            title: 'Invalid Input',
            description: 'Arrival time must be non-negative and burst time must be positive.',
            variant: 'destructive',
          });
          return;
        }
        
        if ((algorithm === SchedulingAlgorithm.PRIORITY_P || algorithm === SchedulingAlgorithm.PRIORITY_NP) 
            && (process.priority === undefined || process.priority < 1)) {
          toast({
            title: 'Invalid Priority',
            description: 'Priority must be a positive number.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      if (algorithm === SchedulingAlgorithm.RR && (timeQuantum <= 0 || isNaN(timeQuantum))) {
        toast({
          title: 'Invalid Time Quantum',
          description: 'Time quantum must be a positive number.',
          variant: 'destructive',
        });
        return;
      }
      
      // Run the algorithm
      onRunAlgorithm(
        algorithm, 
        processes, 
        algorithm === SchedulingAlgorithm.RR ? timeQuantum : undefined
      );
      
      toast({
        title: 'Algorithm Executed',
        description: `Successfully ran ${algorithm} algorithm.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  const needsPriority = algorithm === SchedulingAlgorithm.PRIORITY_P || algorithm === SchedulingAlgorithm.PRIORITY_NP;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduling Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="algorithm">Algorithm</Label>
          <Select
            value={algorithm}
            onValueChange={(value) => setAlgorithm(value as SchedulingAlgorithm)}
          >
            <SelectTrigger id="algorithm">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SchedulingAlgorithm.FCFS}>{SchedulingAlgorithm.FCFS}</SelectItem>
              <SelectItem value={SchedulingAlgorithm.SJF}>{SchedulingAlgorithm.SJF}</SelectItem>
              <SelectItem value={SchedulingAlgorithm.SRTF}>{SchedulingAlgorithm.SRTF}</SelectItem>
              <SelectItem value={SchedulingAlgorithm.RR}>{SchedulingAlgorithm.RR}</SelectItem>
              <SelectItem value={SchedulingAlgorithm.PRIORITY_NP}>{SchedulingAlgorithm.PRIORITY_NP}</SelectItem>
              <SelectItem value={SchedulingAlgorithm.PRIORITY_P}>{SchedulingAlgorithm.PRIORITY_P}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {algorithm === SchedulingAlgorithm.RR && (
          <div className="space-y-2">
            <Label>Time Quantum: {timeQuantum}</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[timeQuantum]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setTimeQuantum(value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(parseInt(e.target.value) || 1)}
                min={1}
                className="w-20"
              />
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Process List</h3>
            <Button onClick={handleAddProcess} variant="outline" size="sm">
              Add Process
            </Button>
          </div>
          
          <div className="space-y-4">
            {processes.map((process, index) => (
              <div key={process.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 border rounded-md">
                <div>
                  <Label>Process ID</Label>
                  <div className="font-medium">{process.id}</div>
                </div>
                
                <div>
                  <Label htmlFor={`arrival-${index}`}>Arrival Time</Label>
                  <Input
                    id={`arrival-${index}`}
                    type="number"
                    value={process.arrivalTime}
                    onChange={(e) => handleProcessChange(index, 'arrivalTime', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`burst-${index}`}>Burst Time</Label>
                  <Input
                    id={`burst-${index}`}
                    type="number"
                    value={process.burstTime}
                    onChange={(e) => handleProcessChange(index, 'burstTime', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
                
                {needsPriority && (
                  <div>
                    <Label htmlFor={`priority-${index}`}>Priority</Label>
                    <Input
                      id={`priority-${index}`}
                      type="number"
                      value={process.priority}
                      onChange={(e) => handleProcessChange(index, 'priority', parseInt(e.target.value) || 1)}
                      min={1}
                    />
                  </div>
                )}
                
                <div className={needsPriority ? 'md:col-span-4' : 'md:col-span-1'} style={{ textAlign: 'right' }}>
                  <Button 
                    onClick={() => handleRemoveProcess(index)} 
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button onClick={handleRunAlgorithm} size="lg" className="w-full">
          Run Algorithm
        </Button>
      </CardContent>
    </Card>
  );
};

export default InputPanel;
