
import { Process, GanttProcess, SchedulingAlgorithm, ProcessResult } from './types';

// Helper function to calculate turnaround time and waiting time
const calculateTimes = (processes: Process[]): Process[] => {
  return processes.map(process => {
    if (process.finishTime === undefined || process.startTime === undefined) {
      throw new Error(`Process ${process.id} is missing finish or start time`);
    }
    const turnaroundTime = process.finishTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    
    return {
      ...process,
      turnaroundTime,
      waitingTime,
    };
  });
};

// First Come First Serve (FCFS) algorithm
export const fcfs = (processes: Process[]): ProcessResult => {
  // Sort processes by arrival time
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  let currentTime = 0;
  const ganttChart: GanttProcess[] = [];
  
  sortedProcesses.forEach((process, index) => {
    // If the process hasn't arrived yet, advance the current time
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }
    
    // Record the start time
    sortedProcesses[index] = {
      ...process,
      startTime: currentTime,
    };
    
    // Add to Gantt chart
    ganttChart.push({
      id: process.id,
      start: currentTime,
      end: currentTime + process.burstTime,
    });
    
    // Update current time and record finish time
    currentTime += process.burstTime;
    sortedProcesses[index] = {
      ...sortedProcesses[index],
      finishTime: currentTime,
    };
  });
  
  // Calculate turnaround time and waiting time
  const processesWithTimes = calculateTimes(sortedProcesses);
  
  // Calculate averages
  const averageTurnaroundTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / 
    processesWithTimes.length;
  
  const averageWaitingTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / 
    processesWithTimes.length;
  
  return {
    processes: processesWithTimes,
    ganttChart,
    averageTurnaroundTime,
    averageWaitingTime,
  };
};

// Shortest Job First (SJF) algorithm
export const sjf = (processes: Process[]): ProcessResult => {
  const processQueue = [...processes].map(p => ({ ...p }));
  
  let currentTime = 0;
  const ganttChart: GanttProcess[] = [];
  const completedProcesses: Process[] = [];
  
  while (processQueue.length > 0) {
    // Find processes that have arrived by the current time
    const arrivedProcesses = processQueue.filter(p => p.arrivalTime <= currentTime);
    
    if (arrivedProcesses.length === 0) {
      // No processes have arrived yet, advance time to the next arrival
      const nextArrival = Math.min(...processQueue.map(p => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the shortest job among the arrived processes
    const shortestJob = arrivedProcesses.reduce(
      (prev, curr) => prev.burstTime < curr.burstTime ? prev : curr
    );
    
    // Remove the process from the queue
    const index = processQueue.findIndex(p => p.id === shortestJob.id);
    processQueue.splice(index, 1);
    
    // Record the start time
    shortestJob.startTime = currentTime;
    
    // Add to Gantt chart
    ganttChart.push({
      id: shortestJob.id,
      start: currentTime,
      end: currentTime + shortestJob.burstTime,
    });
    
    // Update current time and record finish time
    currentTime += shortestJob.burstTime;
    shortestJob.finishTime = currentTime;
    
    // Add to completed processes
    completedProcesses.push(shortestJob);
  }
  
  // Calculate turnaround time and waiting time
  const processesWithTimes = calculateTimes(completedProcesses);
  
  // Calculate averages
  const averageTurnaroundTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / 
    processesWithTimes.length;
  
  const averageWaitingTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / 
    processesWithTimes.length;
  
  return {
    processes: processesWithTimes,
    ganttChart,
    averageTurnaroundTime,
    averageWaitingTime,
  };
};

// Shortest Remaining Time First (SRTF) algorithm
export const srtf = (processes: Process[]): ProcessResult => {
  const processQueue = [...processes].map(p => ({ 
    ...p, 
    remainingTime: p.burstTime,
    startTime: -1 // Initialize startTime to -1 to indicate not started yet
  }));
  
  let currentTime = 0;
  let prevProcess: Process | null = null;
  const ganttChart: GanttProcess[] = [];
  const completedProcesses: Process[] = [];
  
  // Continue until all processes are completed
  while (processQueue.length > 0) {
    // Find processes that have arrived by the current time
    const arrivedProcesses = processQueue.filter(p => p.arrivalTime <= currentTime);
    
    if (arrivedProcesses.length === 0) {
      // No processes have arrived yet, advance time to the next arrival
      const nextArrival = Math.min(...processQueue.map(p => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the process with the shortest remaining time
    const shortestRemainingJob = arrivedProcesses.reduce(
      (prev, curr) => (prev.remainingTime || Infinity) < (curr.remainingTime || Infinity) ? prev : curr
    );
    
    // If this is the first execution or if the process changed
    if (prevProcess === null || prevProcess.id !== shortestRemainingJob.id) {
      if (prevProcess !== null) {
        // Add previous process execution to Gantt chart
        const lastGantt = ganttChart[ganttChart.length - 1];
        if (lastGantt && lastGantt.id === prevProcess.id) {
          // Update the end time of the last segment if it's the same process
          lastGantt.end = currentTime;
        }
      }
      
      // If this process is starting for the first time, record its start time
      if (shortestRemainingJob.startTime === -1) {
        shortestRemainingJob.startTime = currentTime;
      }
      
      // Add new process execution to Gantt chart
      ganttChart.push({
        id: shortestRemainingJob.id,
        start: currentTime,
        end: currentTime + 1, // Will be updated later
      });
      
      prevProcess = shortestRemainingJob;
    }
    
    // Execute process for 1 time unit
    currentTime++;
    
    // Reduce remaining time for the selected process
    const index = processQueue.findIndex(p => p.id === shortestRemainingJob.id);
    if (processQueue[index].remainingTime !== undefined) {
      processQueue[index].remainingTime--;
      
      // If process is completed
      if (processQueue[index].remainingTime === 0) {
        const completedProcess = processQueue[index];
        completedProcess.finishTime = currentTime;
        
        // Update the last Gantt chart entry's end time
        const lastGantt = ganttChart[ganttChart.length - 1];
        if (lastGantt) {
          lastGantt.end = currentTime;
        }
        
        // Add to completed processes
        completedProcesses.push(completedProcess);
        
        // Remove from queue
        processQueue.splice(index, 1);
        
        // Reset prevProcess
        prevProcess = null;
      }
    }
  }
  
  // Calculate turnaround time and waiting time
  const processesWithTimes = calculateTimes(completedProcesses);
  
  // Calculate averages
  const averageTurnaroundTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / 
    processesWithTimes.length;
  
  const averageWaitingTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / 
    processesWithTimes.length;
  
  return {
    processes: processesWithTimes,
    ganttChart,
    averageTurnaroundTime,
    averageWaitingTime,
  };
};

// Round Robin (RR) algorithm
export const roundRobin = (processes: Process[], timeQuantum: number): ProcessResult => {
  if (timeQuantum <= 0) {
    throw new Error("Time quantum must be greater than 0");
  }
  
  const processQueue = [...processes].map(p => ({ 
    ...p, 
    remainingTime: p.burstTime,
    startTime: -1 // Initialize startTime to -1 to indicate not started yet
  }));
  
  let currentTime = 0;
  const ganttChart: GanttProcess[] = [];
  const completedProcesses: Process[] = [];
  
  // Create a ready queue
  let readyQueue: Process[] = [];
  
  while (processQueue.length > 0 || readyQueue.length > 0) {
    // Check if new processes have arrived
    const newArrivals = processQueue.filter(p => p.arrivalTime <= currentTime);
    
    readyQueue.push(...newArrivals);
    newArrivals.forEach(p => {
      const index = processQueue.findIndex(proc => proc.id === p.id);
      if (index !== -1) {
        processQueue.splice(index, 1);
      }
    });
    
    if (readyQueue.length === 0) {
      // No processes in ready queue, advance time to the next arrival
      if (processQueue.length > 0) {
        const nextArrival = Math.min(...processQueue.map(p => p.arrivalTime));
        currentTime = nextArrival;
        continue;
      }
      break; // No more processes to execute
    }
    
    // Get the next process from the ready queue
    const currentProcess = readyQueue.shift() as Process;
    
    // If this process is starting for the first time, record its start time
    if (currentProcess.startTime === -1) {
      currentProcess.startTime = currentTime;
    }
    
    // Calculate execution time for this round
    const executionTime = Math.min(timeQuantum, currentProcess.remainingTime || 0);
    
    // Add to Gantt chart
    ganttChart.push({
      id: currentProcess.id,
      start: currentTime,
      end: currentTime + executionTime,
    });
    
    // Update current time
    currentTime += executionTime;
    
    // Reduce remaining time
    if (currentProcess.remainingTime !== undefined) {
      currentProcess.remainingTime -= executionTime;
      
      // If process is completed
      if (currentProcess.remainingTime === 0) {
        currentProcess.finishTime = currentTime;
        completedProcesses.push(currentProcess);
      } else {
        // Add back to ready queue
        // But first check for new arrivals during this execution
        const newArrivals = processQueue.filter(p => p.arrivalTime <= currentTime);
        readyQueue.push(...newArrivals);
        newArrivals.forEach(p => {
          const index = processQueue.findIndex(proc => proc.id === p.id);
          if (index !== -1) {
            processQueue.splice(index, 1);
          }
        });
        // Add the current process to the end of the ready queue
        readyQueue.push(currentProcess);
      }
    }
  }
  
  // Calculate turnaround time and waiting time
  const processesWithTimes = calculateTimes(completedProcesses);
  
  // Calculate averages
  const averageTurnaroundTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / 
    processesWithTimes.length;
  
  const averageWaitingTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / 
    processesWithTimes.length;
  
  return {
    processes: processesWithTimes,
    ganttChart,
    averageTurnaroundTime,
    averageWaitingTime,
  };
};

// Priority Scheduling (Non-preemptive) algorithm
export const priorityNonPreemptive = (processes: Process[]): ProcessResult => {
  const processQueue = [...processes].map(p => ({ ...p }));
  
  let currentTime = 0;
  const ganttChart: GanttProcess[] = [];
  const completedProcesses: Process[] = [];
  
  while (processQueue.length > 0) {
    // Find processes that have arrived by the current time
    const arrivedProcesses = processQueue.filter(p => p.arrivalTime <= currentTime);
    
    if (arrivedProcesses.length === 0) {
      // No processes have arrived yet, advance time to the next arrival
      const nextArrival = Math.min(...processQueue.map(p => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the highest priority process among the arrived processes
    // Lower priority value means higher priority
    const highestPriorityJob = arrivedProcesses.reduce(
      (prev, curr) => (prev.priority || Infinity) < (curr.priority || Infinity) ? prev : curr
    );
    
    // Remove the process from the queue
    const index = processQueue.findIndex(p => p.id === highestPriorityJob.id);
    processQueue.splice(index, 1);
    
    // Record the start time
    highestPriorityJob.startTime = currentTime;
    
    // Add to Gantt chart
    ganttChart.push({
      id: highestPriorityJob.id,
      start: currentTime,
      end: currentTime + highestPriorityJob.burstTime,
    });
    
    // Update current time and record finish time
    currentTime += highestPriorityJob.burstTime;
    highestPriorityJob.finishTime = currentTime;
    
    // Add to completed processes
    completedProcesses.push(highestPriorityJob);
  }
  
  // Calculate turnaround time and waiting time
  const processesWithTimes = calculateTimes(completedProcesses);
  
  // Calculate averages
  const averageTurnaroundTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / 
    processesWithTimes.length;
  
  const averageWaitingTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / 
    processesWithTimes.length;
  
  return {
    processes: processesWithTimes,
    ganttChart,
    averageTurnaroundTime,
    averageWaitingTime,
  };
};

// Priority Scheduling (Preemptive) algorithm
export const priorityPreemptive = (processes: Process[]): ProcessResult => {
  const processQueue = [...processes].map(p => ({ 
    ...p, 
    remainingTime: p.burstTime,
    startTime: -1 // Initialize startTime to -1 to indicate not started yet
  }));
  
  let currentTime = 0;
  let prevProcess: Process | null = null;
  const ganttChart: GanttProcess[] = [];
  const completedProcesses: Process[] = [];
  
  // Continue until all processes are completed
  while (processQueue.length > 0) {
    // Find processes that have arrived by the current time
    const arrivedProcesses = processQueue.filter(p => p.arrivalTime <= currentTime);
    
    if (arrivedProcesses.length === 0) {
      // No processes have arrived yet, advance time to the next arrival
      const nextArrival = Math.min(...processQueue.map(p => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the highest priority process among the arrived processes
    // Lower priority value means higher priority
    const highestPriorityJob = arrivedProcesses.reduce(
      (prev, curr) => (prev.priority || Infinity) < (curr.priority || Infinity) ? prev : curr
    );
    
    // If this is the first execution or if the process changed
    if (prevProcess === null || prevProcess.id !== highestPriorityJob.id) {
      if (prevProcess !== null) {
        // Add previous process execution to Gantt chart
        const lastGantt = ganttChart[ganttChart.length - 1];
        if (lastGantt && lastGantt.id === prevProcess.id) {
          // Update the end time of the last segment if it's the same process
          lastGantt.end = currentTime;
        }
      }
      
      // If this process is starting for the first time, record its start time
      if (highestPriorityJob.startTime === -1) {
        highestPriorityJob.startTime = currentTime;
      }
      
      // Add new process execution to Gantt chart
      ganttChart.push({
        id: highestPriorityJob.id,
        start: currentTime,
        end: currentTime + 1, // Will be updated later
      });
      
      prevProcess = highestPriorityJob;
    }
    
    // Execute process for 1 time unit
    currentTime++;
    
    // Reduce remaining time for the selected process
    const index = processQueue.findIndex(p => p.id === highestPriorityJob.id);
    if (processQueue[index].remainingTime !== undefined) {
      processQueue[index].remainingTime--;
      
      // If process is completed
      if (processQueue[index].remainingTime === 0) {
        const completedProcess = processQueue[index];
        completedProcess.finishTime = currentTime;
        
        // Update the last Gantt chart entry's end time
        const lastGantt = ganttChart[ganttChart.length - 1];
        if (lastGantt) {
          lastGantt.end = currentTime;
        }
        
        // Add to completed processes
        completedProcesses.push(completedProcess);
        
        // Remove from queue
        processQueue.splice(index, 1);
        
        // Reset prevProcess
        prevProcess = null;
      }
    }
  }
  
  // Calculate turnaround time and waiting time
  const processesWithTimes = calculateTimes(completedProcesses);
  
  // Calculate averages
  const averageTurnaroundTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / 
    processesWithTimes.length;
  
  const averageWaitingTime = 
    processesWithTimes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / 
    processesWithTimes.length;
  
  return {
    processes: processesWithTimes,
    ganttChart,
    averageTurnaroundTime,
    averageWaitingTime,
  };
};

// Main function to run the selected algorithm
export const runSchedulingAlgorithm = (
  algorithm: SchedulingAlgorithm,
  processes: Process[], 
  timeQuantum?: number
): ProcessResult => {
  switch (algorithm) {
    case SchedulingAlgorithm.FCFS:
      return fcfs(processes);
    case SchedulingAlgorithm.SJF:
      return sjf(processes);
    case SchedulingAlgorithm.SRTF:
      return srtf(processes);
    case SchedulingAlgorithm.RR:
      if (!timeQuantum || timeQuantum <= 0) {
        throw new Error("Time quantum must be provided and greater than 0 for Round Robin");
      }
      return roundRobin(processes, timeQuantum);
    case SchedulingAlgorithm.PRIORITY_NP:
      return priorityNonPreemptive(processes);
    case SchedulingAlgorithm.PRIORITY_P:
      return priorityPreemptive(processes);
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
};
