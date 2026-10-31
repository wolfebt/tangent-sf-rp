import React from 'react';

const AppShell = ({ children }) => {
  return (
    <div className="flex flex-col h-full w-full tangent-grid-bg text-slate-100 overflow-hidden font-sans relative">
      <main className="flex-1 overflow-hidden relative h-full w-full">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
