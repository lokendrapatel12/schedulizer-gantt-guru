
export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  remainingTime?: number;
  startTime?: number;
  finishTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
}

export interface GanttProcess {
  id: string;
  start: number;
  end: number;
}

export enum SchedulingAlgorithm {
  FCFS = "First Come First Serve (FCFS)",
  SJF = "Shortest Job First (SJF)",
  SRTF = "Shortest Remaining Time First (SRTF)",
  RR = "Round Robin (RR)",
  PRIORITY_NP = "Priority (Non-preemptive)",
  PRIORITY_P = "Priority (Preemptive)"
}

export interface ProcessResult {
  processes: Process[];
  ganttChart: GanttProcess[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
}
