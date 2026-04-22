import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Algorithm, TableState, OpenAddressingCell, ChainingCell } from '../lib/types';
import { Trash2, ArrowRight } from 'lucide-react';

interface Props {
  algorithm: Algorithm;
  table: TableState;
  activeTarget: { index: number; chainIndex?: number } | null;
  status: 'probing' | 'success' | 'error' | 'idle';
}

export function HashVisualizer({ algorithm, table, activeTarget, status }: Props) {
  const isChaining = algorithm === 'separate-chaining';

  const getCellColor = (isActive: boolean, type: 'empty' | 'filled' | 'deleted') => {
    if (!isActive) {
      if (type === 'empty') return 'bg-slate-800 border-slate-700 text-slate-400';
      if (type === 'deleted') return 'bg-slate-900 border-slate-700 text-slate-600 border-dashed';
      return 'bg-slate-800 border-slate-700 text-slate-200';
    }
    if (status === 'probing') return 'bg-cyan-900/30 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
    if (status === 'success') return 'bg-cyan-900/40 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)]'; 
    if (status === 'error') return 'bg-rose-900/30 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    return '';
  };

  if (isChaining) {
    const chainTable = table as ChainingCell[];
    return (
      <div className="flex flex-col space-y-3 w-full max-w-2xl overflow-x-auto pb-4">
        {chainTable.map((chain, idx) => {
          const isRowActive = activeTarget?.index === idx;
          const indexColor = isRowActive ? (status === 'error' ? 'text-rose-500' : 'text-cyan-500') : 'text-slate-600';
          
          return (
            <div key={idx} className="flex items-center group min-w-max">
              {/* Index */}
              <div className={`w-12 text-sm font-mono transition-colors ${indexColor} pr-2`}>
                [{idx}]
              </div>

              <div className="flex items-center justify-center px-1">
                <ArrowRight className={`w-4 h-4 transition-colors ${isRowActive ? 'text-cyan-500/70' : 'text-slate-700'}`} />
              </div>

              {/* Chain */}
              <div className="flex items-center space-x-1 pl-1">
                {chain.length === 0 ? (
                  <div className={`
                    h-12 px-4 border-2 rounded flex items-center justify-center text-sm font-bold transition-colors
                    ${isRowActive ? getCellColor(true, 'empty') : 'bg-slate-800 border-slate-700 text-slate-400'}
                  `}>
                    NULL
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {chain.map((val, cIdx) => {
                      const isCellActive = isRowActive && activeTarget?.chainIndex === cIdx;
                      return (
                        <React.Fragment key={`${val}`}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            layout
                            className={`
                              min-w-[3rem] h-12 px-2 border-2 rounded flex items-center justify-center text-sm font-bold transition-colors z-10
                              ${getCellColor(isCellActive, 'filled')}
                            `}
                          >
                            {val}
                          </motion.div>
                          <div className="flex items-center justify-center px-1">
                            <ArrowRight className={`w-4 h-4 transition-colors ${isCellActive ? 'text-cyan-500' : 'text-slate-700'}`} />
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {chain.length > 0 && (
                      <motion.div
                        key="chain-null"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`
                        h-12 px-4 border-2 rounded flex items-center justify-center text-sm font-bold transition-colors
                        ${isRowActive && activeTarget?.chainIndex === undefined ? getCellColor(true, 'empty') : 'bg-slate-800 border-slate-700 text-slate-400'}
                      `}>
                        NULL
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Open Addressing Grid
  const openTable = table as OpenAddressingCell[];
  return (
    <div className="w-full max-w-2xl flex flex-wrap gap-3">
      {openTable.map((cell, idx) => {
        const isActive = activeTarget?.index === idx;
        const type = cell.deleted ? 'deleted' : (cell.key === null ? 'empty' : 'filled');
        const isSelectedText = isActive ? (status === 'error' ? 'text-rose-500' : 'text-cyan-500') : 'text-slate-600';
        
        return (
          <div key={idx} className="flex flex-col items-center space-y-1">
            <span className={`text-xs font-mono transition-colors ${isSelectedText}`}>[{idx}]</span>
            <motion.div 
              layout
              className={`
                w-14 h-14 border-2 rounded flex items-center justify-center text-sm font-bold transition-colors relative focus:outline-none
                ${getCellColor(isActive, type)}
              `}
            >
              <AnimatePresence mode="popLayout">
                {cell.deleted ? (
                  <motion.div
                    key="deleted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center w-full h-full text-rose-500"
                  >
                    {/* Visual Tombstone rendering */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Trash2 className="w-8 h-8" />
                    </div>
                    <span className="relative text-[10px] uppercase font-sans font-black tracking-widest text-slate-500 mix-blend-screen bg-slate-900/50 px-1 rounded-sm">DEL</span>
                    {cell.key !== null && <span className="relative text-[10px] text-slate-600 line-through mt-0.5">{cell.key}</span>}
                  </motion.div>
                ) : cell.key !== null ? (
                  <motion.span
                    key={cell.key}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {cell.key}
                  </motion.span>
                ) : (
                  <span key="empty" className="text-slate-400/50">NULL</span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
