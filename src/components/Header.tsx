
import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-primary text-primary-foreground py-4 px-4 shadow-md">
      <div className="container max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">
          Process Scheduling Solver
        </h1>
        <div className="text-sm md:text-base">
          <span>CPU Scheduling Algorithms</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
