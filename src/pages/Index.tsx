
import React, { useState } from 'react';
import Header from '@/components/Header';
import InputPanel from '@/components/InputPanel';
import ResultsPanel from '@/components/ResultsPanel';
import { Process, ProcessResult, SchedulingAlgorithm } from '@/utils/types';
import { runSchedulingAlgorithm } from '@/utils/schedulingAlgorithms';

const Index = () => {
  const [results, setResults] = useState<ProcessResult | null>(null);
  
  const handleRunAlgorithm = (algorithm: SchedulingAlgorithm, processes: Process[], timeQuantum?: number) => {
    const newResults = runSchedulingAlgorithm(algorithm, processes, timeQuantum);
    setResults(newResults);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <InputPanel onRunAlgorithm={handleRunAlgorithm} />
          </div>
          <div>
            <ResultsPanel results={results} />
          </div>
        </div>
      </main>
      
      <footer className="bg-muted py-6">
        <div className="container max-w-7xl mx-auto px-4">
          <p className="text-center text-muted-foreground text-sm">
            Process Scheduling Solver - a simulator for CPU scheduling algorithms
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
