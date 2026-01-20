
import React, { useState, useEffect } from 'react';

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

interface CalculatorProps {
  onUnlock: (pwd: string) => boolean;
}

const Calculator: React.FC<CalculatorProps> = ({ onUnlock }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  const handleNumber = (num: string) => {
    if (display === '0' || lastResult !== null) {
      setDisplay(num);
      setLastResult(null);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
    setLastResult(null);
  };

  const calculate = () => {
    const isUnlocked = onUnlock(display);
    if (isUnlocked) {
      setDisplay('0');
      setExpression('');
      return;
    }

    try {
      if (!expression) return; 
      
      const fullExpr = expression + display;
      const sanitized = fullExpr.replace(/[^-+*/%0-9.]/g, '');
      
      // eslint-disable-next-line no-eval
      const resultValue = eval(sanitized);
      const resultStr = Number.isInteger(resultValue) 
        ? String(resultValue) 
        : parseFloat(resultValue.toFixed(8)).toString();

      const newItem: HistoryItem = {
        expression: fullExpr,
        result: resultStr,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newItem, ...prev].slice(0, 50));

      setDisplay(resultStr);
      setExpression('');
      setLastResult(resultValue);
    } catch (e) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setLastResult(null);
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently clear calculation history?')) {
      setHistory([]);
    }
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setRestoringId(item.timestamp);
    // Brief delay to allow the "pulse" animation to be seen
    setTimeout(() => {
      setDisplay(item.result);
      setExpression('');
      setLastResult(parseFloat(item.result));
      setShowHistory(false);
      setRestoringId(null);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-900">
      <div className="w-full max-w-sm bg-neutral-800 rounded-[3rem] p-7 shadow-[0_50px_100px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] border border-neutral-700/40 relative overflow-hidden">
        
        {/* Advanced History Panel */}
        <div 
          className={`absolute inset-0 z-30 bg-neutral-900/95 backdrop-blur-2xl p-7 flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${
            showHistory ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {/* Grab Handle */}
          <div 
            className="w-16 h-1.5 bg-neutral-700/50 rounded-full mx-auto mb-8 shrink-0 cursor-pointer hover:bg-neutral-600 transition-colors"
            onClick={() => setShowHistory(false)}
          />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-lg tracking-tight">Activity</h3>
              <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-semibold">Decoy Data</span>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={clearHistory} 
                className="text-neutral-500 hover:text-red-400 p-2 transition-colors active:scale-90"
                title="Clear History"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
              <button 
                onClick={() => setShowHistory(false)} 
                className="bg-white/5 hover:bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-lg border border-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600 opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <p className="text-sm font-medium">Empty log</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div 
                  key={item.timestamp + idx} 
                  className={`group relative py-5 px-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 border border-white/5 ${
                    restoringId === item.timestamp 
                      ? 'bg-orange-500/20 border-orange-500/30 scale-95 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
                      : 'bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.98]'
                  }`}
                  onClick={() => restoreFromHistory(item)}
                >
                  <div className="text-neutral-500 text-[11px] mb-2 font-mono group-hover:text-neutral-400 transition-colors">
                    {item.expression} =
                  </div>
                  <div className="flex justify-between items-baseline">
                    <div className="text-white text-3xl font-extralight tracking-tight group-hover:text-orange-400 transition-colors truncate pr-4">
                      {item.result}
                    </div>
                    <div className="text-[10px] text-neutral-600 font-bold shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {/* Subtle selection ring */}
                  <div className={`absolute inset-0 rounded-[1.5rem] border-2 border-orange-500/0 transition-all ${restoringId === item.timestamp ? 'border-orange-500/50 scale-105 opacity-100' : 'opacity-0'}`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3D Display Area */}
        <div 
          className="mb-10 text-right px-7 py-10 bg-black/60 rounded-[2.5rem] shadow-[inset_0_8px_32px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] border border-white/5 min-h-[180px] flex flex-col justify-end transition-all duration-300 relative group cursor-pointer overflow-hidden"
          onClick={() => setShowHistory(true)}
        >
          {/* Screen Glare */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* History Pull Trigger Icon */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-all duration-500 transform group-hover:translate-y-1">
            <div className="w-10 h-1 bg-neutral-500 rounded-full" />
          </div>
          
          <div className="text-neutral-500 text-sm h-6 overflow-hidden truncate font-medium tracking-widest mb-2 opacity-80">
            {expression}
          </div>
          <div className="text-8xl font-extralight text-white overflow-hidden whitespace-nowrap tracking-tighter leading-none drop-shadow-2xl">
            {display}
          </div>
        </div>

        {/* Buttons Grid - 3D Bezel Effect */}
        <div className="grid grid-cols-4 gap-5">
          <CalcButton label="C" onClick={handleClear} type="functional" />
          <CalcButton label="±" onClick={() => setDisplay(String(-parseFloat(display)))} type="functional" />
          <CalcButton label="%" onClick={handlePercent} type="functional" />
          <CalcButton label="÷" onClick={() => handleOperator('/')} type="operator" />

          <CalcButton label="7" onClick={() => handleNumber('7')} />
          <CalcButton label="8" onClick={() => handleNumber('8')} />
          <CalcButton label="9" onClick={() => handleNumber('9')} />
          <CalcButton label="×" onClick={() => handleOperator('*')} type="operator" />

          <CalcButton label="4" onClick={() => handleNumber('4')} />
          <CalcButton label="5" onClick={() => handleNumber('5')} />
          <CalcButton label="6" onClick={() => handleNumber('6')} />
          <CalcButton label="−" onClick={() => handleOperator('-')} type="operator" />

          <CalcButton label="1" onClick={() => handleNumber('1')} />
          <CalcButton label="2" onClick={() => handleNumber('2')} />
          <CalcButton label="3" onClick={() => handleNumber('3')} />
          <CalcButton label="+" onClick={() => handleOperator('+')} type="operator" />

          <CalcButton label="0" onClick={() => handleNumber('0')} className="col-span-2" />
          <CalcButton label="." onClick={() => handleNumber('.')} />
          <CalcButton label="=" onClick={calculate} type="operator" />
        </div>
      </div>
      
      {/* Global Scrollbar Refinement */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  type?: 'number' | 'operator' | 'functional';
  className?: string;
}

const CalcButton: React.FC<CalcButtonProps> = ({ label, onClick, type = 'number', className = '' }) => {
  const getColors = () => {
    switch (type) {
      case 'operator': 
        return 'bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-[0_8px_0_rgb(180,83,9),0_15px_30px_-5px_rgba(249,115,22,0.4)] active:shadow-[0_2px_0_rgb(180,83,9)] hover:from-orange-350 hover:to-orange-550 active:brightness-110';
      case 'functional': 
        return 'bg-gradient-to-b from-neutral-200 to-neutral-400 text-neutral-900 shadow-[0_8px_0_rgb(115,115,115)] active:shadow-[0_2px_0_rgb(115,115,115)] hover:from-white hover:to-neutral-300 active:brightness-95';
      default: 
        return 'bg-gradient-to-b from-neutral-600 to-neutral-700 text-white shadow-[0_8px_0_rgb(38,38,38)] active:shadow-[0_2px_0_rgb(38,38,38)] hover:from-neutral-500 hover:to-neutral-600 active:brightness-125';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${getColors()} ${className} h-[4.5rem] rounded-[1.75rem] flex items-center justify-center text-3xl font-medium transition-all duration-75 ease-out transform active:translate-y-[6px] active:scale-[0.96] active:ring-2 active:ring-white/20 select-none touch-manipulation border-t border-white/10`}
    >
      {label}
    </button>
  );
};

export default Calculator;
