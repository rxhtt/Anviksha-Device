
import React, { useState } from 'react';
import type { AnalysisResult } from '../types.ts';
import { SyncIcon, RecordsIcon, SearchIcon, ArrowLeftIcon, InfoIcon } from './IconComponents.tsx';

interface RecordsScreenProps {
  records: AnalysisResult[];
  onViewRecord: (id: string) => void;
  onBackToHome?: () => void;
}

const RecordCard: React.FC<{ record: AnalysisResult, onViewRecord: (id: string) => void }> = ({ record, onViewRecord }) => {
    return (
        <button 
            onClick={() => onViewRecord(record.id)}
            className="w-full bg-white p-4 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors group first:rounded-t-2xl last:rounded-b-2xl last:border-0"
        >
            <div className="flex flex-col items-start text-left">
                <span className="font-bold text-slate-900 text-[15px]">{record.condition}</span>
                <span className="text-xs text-slate-400 mt-0.5">{new Date(record.date).toLocaleDateString()} • {record.confidence}% Match</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${record.isEmergency ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
        </button>
    )
}

const RecordsScreen: React.FC<RecordsScreenProps> = ({ records, onViewRecord, onBackToHome }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecords = records.filter(record => 
        record.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col h-full">
       <div className="mb-6">
           <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
                <input 
                    type="text"
                    placeholder="Search records"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
           </div>
       </div>

       <div className="flex-1 overflow-y-auto">
         {filteredRecords.length > 0 ? (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                 {filteredRecords.map(rec => <RecordCard key={rec.id} record={rec} onViewRecord={onViewRecord} />)}
             </div>
         ) : (
             <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                 <div className="text-4xl mb-2 opacity-20"><RecordsIcon /></div>
                 <p className="text-sm font-medium">No records found</p>
             </div>
         )}
       </div>
    </div>
  );
};

export default RecordsScreen;
