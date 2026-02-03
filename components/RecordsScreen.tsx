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
            className="w-full bg-white p-6 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50/80 transition-all group first:rounded-t-[2rem] last:rounded-b-[2rem] last:border-0 relative overflow-hidden active:scale-[0.99]"
        >
            <div className="flex flex-col items-start text-left relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-slate-900 text-lg tracking-tight">{record.condition}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
                        {record.modality || 'GEN'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400/80 uppercase tracking-widest">{dateStr}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400/80 uppercase tracking-widest">{timeStr}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${record.confidence > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{record.confidence}% Reliability</span>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-3 h-3 rounded-full ${record.isEmergency ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-400'} animate-pulse`}></div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>
        </button>
    )
}

const RecordsScreen: React.FC<RecordsScreenProps> = ({ records, onViewRecord, onBackToHome }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');

    const stats = useMemo(() => {
        if (records.length === 0) return null;
        const total = records.length;
        const urgent = records.filter(r => r.isEmergency).length;
        const avgConfidence = Math.round(records.reduce((acc, r) => acc + r.confidence, 0) / total);
        return { total, urgent, avgConfidence };
    }, [records]);

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
        <div className="flex flex-col h-full bg-[#f8fafc] page-transition">
            <div className="p-8 pb-4 shrink-0">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Patient Files</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Historical Clinical Data • Secure</p>
                    </div>
                </div>

                {stats && (
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-white p-6 rounded-[1.8rem] border border-slate-100 shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Scans</p>
                            <p className="text-xl font-black text-slate-900">{stats.total}</p>
                        </div>
                        <div className={`p-6 rounded-[1.8rem] border shadow-sm ${stats.urgent > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-slate-100'}`}>
                            <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Criticals</p>
                            <p className="text-xl font-black">{stats.urgent}</p>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[1.8rem] text-white shadow-xl shadow-slate-200">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reliability</p>
                            <p className="text-xl font-black text-blue-400">{stats.avgConfidence}%</p>
                        </div>
                    </div>
                )}

                <div className="relative mb-6">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
                    <input
                        type="text"
                        placeholder="Search by diagnosis, date, or clinical ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-[15px] font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-slate-200/40"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {[
                        { label: 'Timeline Desc', val: 'date_desc' },
                        { label: 'Timeline Asc', val: 'date_asc' },
                        { label: 'Max Confidence', val: 'confidence_desc' }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setSortOption(opt.val as SortOption)}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${sortOption === opt.val ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
                {filteredAndSortedRecords.length > 0 ? (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden divide-y divide-slate-50">
                        {filteredAndSortedRecords.map(rec => <RecordCard key={rec.id} record={rec} onViewRecord={onViewRecord} />)}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-200/50">
                            <RecordsIcon />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">No Clinical Data</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">System scan returned null results for the current search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordsScreen;