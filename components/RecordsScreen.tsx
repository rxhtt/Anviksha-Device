import React, { useState, useMemo } from 'react';
import type { AnalysisResult } from '../types.ts';
import { RecordsIcon, SearchIcon } from './IconComponents.tsx';

interface RecordsScreenProps {
  records: AnalysisResult[];
  onViewRecord: (id: string) => void;
  onBackToHome?: () => void;
}

type SortOption = 'date_desc' | 'date_asc' | 'confidence_desc' | 'condition_asc';

const RecordCard: React.FC<{ record: AnalysisResult, onViewRecord: (id: string) => void }> = ({ record, onViewRecord }) => {
    const dateObj = new Date(record.date);
    const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
        <button 
            onClick={() => onViewRecord(record.id)}
            className="w-full bg-white p-4 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors group first:rounded-t-2xl last:rounded-b-2xl last:border-0"
        >
            <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-[15px]">{record.condition}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">
                        {record.modality || 'GEN'}
                    </span>
                </div>
                <span className="text-xs text-slate-400 mt-0.5">{dateStr} at {timeStr} • {record.confidence}% Conf.</span>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${record.isEmergency ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
        </button>
    )
}

const RecordsScreen: React.FC<RecordsScreenProps> = ({ records, onViewRecord, onBackToHome }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');

    const filteredAndSortedRecords = useMemo(() => {
        let result = records.filter(record => {
            const query = searchQuery.toLowerCase();
            return (
                record.condition.toLowerCase().includes(query) ||
                record.id.toLowerCase().includes(query) ||
                new Date(record.date).toLocaleDateString().includes(query)
            );
        });

        result.sort((a, b) => {
            switch (sortOption) {
                case 'date_desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date_asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'confidence_desc':
                    return b.confidence - a.confidence;
                case 'condition_asc':
                    return a.condition.localeCompare(b.condition);
                default:
                    return 0;
            }
        });

        return result;
    }, [records, searchQuery, sortOption]);

  return (
    <div className="flex flex-col h-full">
       <div className="mb-4">
           <div className="relative mb-3">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
                <input 
                    type="text"
                    placeholder="Search condition, date, or ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                />
           </div>

           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               <button 
                   onClick={() => setSortOption('date_desc')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${sortOption === 'date_desc' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                   Newest
               </button>
               <button 
                   onClick={() => setSortOption('date_asc')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${sortOption === 'date_asc' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                   Oldest
               </button>
               <button 
                   onClick={() => setSortOption('confidence_desc')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${sortOption === 'confidence_desc' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                   Highest Confidence
               </button>
           </div>
       </div>

       <div className="flex-1 overflow-y-auto pb-4">
         {filteredAndSortedRecords.length > 0 ? (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                 {filteredAndSortedRecords.map(rec => <RecordCard key={rec.id} record={rec} onViewRecord={onViewRecord} />)}
             </div>
         ) : (
             <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                 <div className="text-4xl mb-2 opacity-20"><RecordsIcon /></div>
                 <p className="text-sm font-medium">No matching records found</p>
             </div>
         )}
       </div>
    </div>
  );
};

export default RecordsScreen;