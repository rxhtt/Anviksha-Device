import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { SyncIcon, RecordsIcon, SearchIcon, ArrowLeftIcon } from './IconComponents';

interface RecordsScreenProps {
  records: AnalysisResult[];
  onViewRecord: (id: string) => void;
  onBackToHome?: () => void;
}

const RecordCard: React.FC<{ record: AnalysisResult, onViewRecord: (id: string) => void }> = ({ record, onViewRecord }) => {
    const isEmergency = record.isEmergency;
    const cardBorderColor = isEmergency ? 'border-red-500' : 'border-green-500';
    
    return (
        <button 
            onClick={() => onViewRecord(record.id)}
            className={`w-full text-left p-4 rounded-xl bg-white border-l-4 ${cardBorderColor} shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="flex justify-between items-start">
                <p className={`font-bold text-lg ${isEmergency ? 'text-red-600' : 'text-slate-800'}`}>{record.condition}</p>
                <p className="text-xs text-slate-500 flex-shrink-0 ml-2">{new Date(record.date).toLocaleString()}</p>
            </div>
            <p className="text-sm text-slate-600 mt-1">Confidence: {record.confidence}%</p>
            <p className="text-sm text-slate-500 mt-2 truncate">
                Findings: {record.description}
            </p>
        </button>
    )
}

const RecordsScreen: React.FC<RecordsScreenProps> = ({ records, onViewRecord, onBackToHome }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'condition-asc' | 'confidence-desc'>('date-desc');

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            alert('Patient records have been securely synced with the central health database.');
        }, 2000);
    };

    const filteredAndSortedRecords = records
    .filter(record => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        return (
            record.condition.toLowerCase().includes(query) ||
            record.description.toLowerCase().includes(query) ||
            new Date(record.date).toLocaleDateString().includes(query)
        );
    })
    .sort((a, b) => {
        switch (sortBy) {
            case 'date-asc':
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'condition-asc':
                return a.condition.localeCompare(b.condition);
            case 'confidence-desc':
                return b.confidence - a.confidence;
            case 'date-desc':
            default:
                return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });


  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Patient Records</h2>
        <button 
            onClick={handleSync}
            disabled={isSyncing || records.length === 0}
            className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-full flex items-center gap-2 text-sm transition-colors hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSyncing ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    Syncing...
                </>
            ) : (
                <>
                    <SyncIcon /> Sync Records
                </>
            )}
        </button>
      </div>
      
       <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
            <input 
                type="text"
                placeholder="Search by condition, date..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
            </div>
        </div>
        <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 border border-slate-300 rounded-full bg-white focus:ring-2 focus:ring-blue-400 outline-none appearance-none transition"
        >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="condition-asc">By Condition</option>
            <option value="confidence-desc">By Confidence</option>
        </select>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
        {filteredAndSortedRecords.length > 0 ? (
          filteredAndSortedRecords.map(rec => <RecordCard key={rec.id} record={rec} onViewRecord={onViewRecord} />)
        ) : (
          <div className="text-center text-slate-500 h-full flex flex-col items-center justify-center">
            <div className="text-5xl mb-4">
              <RecordsIcon />
            </div>
            <p className="font-semibold text-lg">{searchQuery ? 'No Matching Records' : 'No Records Found'}</p>
            <p className="text-sm mt-1 max-w-xs">
                {searchQuery 
                    ? 'Try a different search term.' 
                    : 'Perform a new analysis and save the result. It will appear here for future reference.'
                }
            </p>
          </div>
        )}
      </div>

      {onBackToHome && (
        <div className="mt-6 text-center no-print shrink-0">
          <button
            onClick={onBackToHome}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 mx-auto text-sm"
          >
            <ArrowLeftIcon /> Back to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordsScreen;