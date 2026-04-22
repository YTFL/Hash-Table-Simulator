import React from 'react';

export function EducationalSection() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-300">
      <div>
        <h3 className="text-xs font-bold text-cyan-500 uppercase mb-2">The Pigeonhole Principle</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Collisions occur when <span className="text-slate-300 italic">n</span> keys are mapped to <span className="text-slate-300 italic">m</span> slots where n &gt; m. No hash function can map all unique keys to unique slots perfectly.
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
          Collision resolution strategies (Chaining, Linear Probing, Double Hashing) dictate where the data goes when its primary slot is already occupied.
        </p>
      </div>
      
      <div className="md:border-l md:border-slate-800 md:pl-8">
        <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">Algorithm Mechanics</h3>
        <div className="space-y-3">
           <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-cyan-400 border border-slate-800">
             // Chaining
             <br/>Bucket[hash(k)].append(k)
           </div>
           <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-400 border border-slate-800">
             // Closed Addressing (Probing)
             <br/>idx = (hash(k) + i) % N
           </div>
        </div>
      </div>
      
      <div className="md:border-l md:border-slate-800 md:pl-8">
        <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">Key Terminologies</h3>
        <ul className="text-[11px] text-slate-400 space-y-2">
          <li className="flex items-center"><span className="w-1 h-1 bg-cyan-500 rounded-full mr-2"></span> Load Factor (α) - Ratio of elements to slots</li>
           <li className="flex items-center"><span className="w-1 h-1 bg-cyan-500 rounded-full mr-2"></span> Primary Clustering - Build up of occupied slots</li>
           <li className="flex items-center"><span className="w-1 h-1 bg-cyan-500 rounded-full mr-2"></span> Double Hashing - Uses secondary hash for steps</li>
        </ul>
      </div>
    </footer>
  );
}
