import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Algorithm, TableState, AnimationFrame, LogEntry } from './lib/types';
import { initializeTable, simulateOperation } from './lib/simulator';
import { HashVisualizer } from './components/HashVisualizer';
import { EducationalSection } from './components/EducationalSection';

export default function App() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('separate-chaining');
  const [tableSize, setTableSize] = useState<number>(10);
  const [table, setTable] = useState<TableState>(() => initializeTable(10, 'separate-chaining'));
  const [activeTarget, setActiveTarget] = useState<{ index: number; chainIndex?: number } | null>(null);
  const [status, setStatus] = useState<'probing' | 'success' | 'error' | 'idle'>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // Playback execution state
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  
  const [inputValue, setInputValue] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const resetEnvironment = (nextSize: number, nextAlgorithm: Algorithm) => {
    setAlgorithm(nextAlgorithm);
    setTableSize(nextSize);
    setTable(initializeTable(nextSize, nextAlgorithm));
    setLogs([]);
    setActiveTarget(null);
    setStatus('idle');
    setInputValue('');
    setPlaybackState('idle');
    setFrames([]);
    setFrameIndex(0);
    setActiveNoteId(null);
  };

  // Main playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playbackState === 'playing' && frames.length > 0) {
      timer = setTimeout(() => {
        if (frameIndex < frames.length - 1) {
          const nextIdx = frameIndex + 1;
          const frame = frames[nextIdx];
          setTable(frame.table);
          setActiveTarget(frame.activeTarget);
          setStatus(frame.status);
          addLog(frame.log);
          setFrameIndex(nextIdx);
          
          if (nextIdx === frames.length - 1) {
            finishExecution();
          }
        }
      }, 1000); // 1s per step
    }
    return () => clearTimeout(timer);
  }, [playbackState, frames, frameIndex]);

  const handleReset = () => {
    resetEnvironment(tableSize, algorithm);
  };

  const addLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const finishExecution = () => {
    setPlaybackState('idle');
    setTimeout(() => {
      setActiveTarget(null);
      setStatus('idle');
    }, 2000);
  };

  const runOperation = (operation: 'insert' | 'search' | 'delete') => {
    if (playbackState !== 'idle') return;
    
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0) {
      addLog({ id: `err-${Date.now()}-${Math.random()}`, text: 'Please enter a valid positive number.', type: 'warning' });
      return;
    }

    const generatedFrames = simulateOperation(table, tableSize, algorithm, operation, val);
    if (generatedFrames.length === 0) return;

    setStatus('idle');
    addLog({ 
      id: `start-${Date.now()}-${Math.random()}`, 
      text: `--- Starting ${operation.toUpperCase()} for Key ${val} ---`, 
      type: 'info' 
    });

    setFrames(generatedFrames);
    setFrameIndex(0);
    
    // Apply immediate first frame
    const firstFrame = generatedFrames[0];
    setTable(firstFrame.table);
    setActiveTarget(firstFrame.activeTarget);
    setStatus(firstFrame.status);
    addLog(firstFrame.log);

    setInputValue('');

    if (generatedFrames.length === 1) {
       finishExecution();
    } else {
       setPlaybackState('playing');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 font-sans h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-950 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
            <Hash className="w-5 h-5 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Hash Table Simulator</h1>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          {(['separate-chaining', 'linear-probing', 'double-hashing'] as Algorithm[]).map((alg) => (
            <button 
              key={alg}
              onClick={() => resetEnvironment(tableSize, alg)}
              disabled={playbackState !== 'idle'}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${algorithm === alg ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {alg.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Sidebar: Controls */}
        <aside className="col-span-3 border-r border-slate-700 bg-slate-900/50 p-6 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Table Configuration</label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Table Size (N)</span>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{tableSize}</span>
                </div>
                <input 
                  type="range" 
                  className="w-full accent-cyan-500" 
                  min="3" max="50" 
                  value={tableSize}
                  onChange={(e) => {
                    const nextSize = Math.max(3, parseInt(e.target.value) || 10);
                    resetEnvironment(nextSize, algorithm);
                  }}
                  disabled={playbackState !== 'idle'}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Operations</label>
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Enter Key (e.g. 42)" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={playbackState !== 'idle'}
                    onKeyDown={(e) => {
                       if(e.key === 'Enter' && playbackState === 'idle') runOperation('insert');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50" 
                  />
                  <span className="absolute right-3 top-3 text-slate-600 text-xs py-1 px-2 border border-slate-800 rounded">INT</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => runOperation('insert')} 
                    disabled={playbackState !== 'idle'}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Insert Key
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => runOperation('search')}
                      disabled={playbackState !== 'idle'}
                      className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Search
                    </button>
                    <button 
                      onClick={() => runOperation('delete')}
                      disabled={playbackState !== 'idle'}
                      className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <button 
                onClick={handleReset} 
                disabled={playbackState === 'playing'}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest font-semibold"
              >
                <RotateCcw className="w-4 h-4" /> Reset Environment
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border-t border-slate-800 pt-6 mt-6">
            <EducationalSection
              activeNoteId={activeNoteId}
              onSelectNote={setActiveNoteId}
              onCloseNote={() => setActiveNoteId(null)}
            />
          </div>
        </aside>

        {/* Visualization Area */}
        <main className="col-span-6 bg-slate-950 flex flex-col min-h-0 overflow-hidden relative">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-10 shrink-0">
            <div>
               <h2 className="text-xl font-light text-white tracking-tight">Memory Visualization</h2>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-2.5 h-2.5 rounded-full ${playbackState === 'playing' ? 'bg-amber-500 animate-pulse' : playbackState === 'paused' ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'}`}></div>
               <span className="text-xs uppercase tracking-widest font-semibold text-slate-500">
                 {playbackState === 'playing' ? 'Executing' : playbackState === 'paused' ? 'Paused' : 'Ready'}
               </span>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 overflow-auto p-8 flex justify-center">
            <HashVisualizer 
              algorithm={algorithm}
              table={table}
              activeTarget={activeTarget}
              status={status}
            />
          </div>
        </main>

        {/* Right: Log & Console */}
        <aside className="col-span-3 border-l border-slate-700 bg-slate-950 p-4 flex flex-col overflow-hidden">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Runtime Execution Log</label>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-y-auto flex flex-col">
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {logs.length === 0 && (
                   <motion.div key="system-ready" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-slate-500">
                     [SYSTEM]: Environment ready. Waiting for input...
                   </motion.div>
                )}
                {logs.map((log) => {
                   let textColor = "text-slate-400";
                   if (log.type === 'error') textColor = "text-rose-400";
                   if (log.type === 'success') textColor = "text-emerald-400";
                   if (log.type === 'warning') textColor = "text-amber-400 font-bold italic";
                   if (log.text.startsWith('---')) textColor = "text-cyan-400 font-bold";

                   return (
                     <motion.div 
                       key={log.id}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       className={`${textColor}`}
                     >
                       {log.text.startsWith('---') ? log.text : `> ${log.text}`}
                     </motion.div>
                   );
                })}
              </AnimatePresence>
            </div>
            <div key="log-end-ref" ref={logEndRef} />
            <div className="mt-auto pt-4 flex items-center">
              <span className="text-cyan-500 mr-2">_</span>
              <span className="animate-pulse w-1 h-3 bg-slate-500"></span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

