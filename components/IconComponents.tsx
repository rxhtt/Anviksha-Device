
import React from 'react';

// --- Core UI Icons ---

export const ArrowLeftIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export const CameraIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const CameraOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 10l4.55a2 2 0 01.95 1.666V18a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h7.05a2 2 0 011.666.95L15 10z" />
        <path d="M19 1L5 15" />
    </svg>
);

export const SettingsIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const WifiIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.111 16.555a5.5 5.5 0 017.778 0M12 20.25a.75.75 0 01.75-.75h.008a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM4.444 12.889a10 10 0 0115.112 0" />
    </svg>
);

export const WifiOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.111 16.555a5.5 5.5 0 014.34-1.95m2.222 2.222a5.5 5.5 0 01-6.562 0M12 20.25a.75.75 0 01.75-.75h.008a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM4.444 12.889a10 10 0 011.62-1.84m11.872 1.84a10 10 0 00-1.62-1.84M3 3l18 18" />
    </svg>
);

export const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const RetakeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

export const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

export const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const AlertIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

// --- Medical Modality Icons (Enhanced) ---

export const HeartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
       <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

export const EKGIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 13.5L17 8.5L14.5 15.5L12 3.5L9.5 15.5L7 9.5L4.5 13.5H2" />
        <path d="M22 13.5H19.5" />
    </svg>
);

export const LungsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 18c-2.21 0-4-1.79-4-4v-3a5 5 0 015-5h.5a5 5 0 015 5v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1a3 3 0 00-3-3 3 3 0 00-3 3v3a2 2 0 002 2h.5" />
        <path d="M17 18c2.21 0 4-1.79 4-4v-3a5 5 0 00-5-5h-.5a5 5 0 00-5 5v1a1 1 0 001 1h1a1 1 0 001-1v-1a3 3 0 013-3 3 3 0 013 3v3a2 2 0 01-2 2h-.5" />
    </svg>
);

export const BrainIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
       <path d="M12 4C8 4 6 8 6 8s-2.5 1.5-2.5 4.5C3.5 16 6.5 19.5 9 20.5c2.5 1 5.5 0 8-2.5l.5-3.5c1-1 3-1 3-3.5 0-2.5-2.5-4-2.5-4s-1.5-3-6-3z" />
       <path d="M10 9c0 1.5 2.5 3.5 2.5 5" />
       <path d="M15.5 7.5C15.5 10 14 11 14 11" />
    </svg>
);

export const DropIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 009-9c0-4.97-9-13-9-13S3 7.03 3 12a9 9 0 009 9z" />
    </svg>
);

export const BoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 19.5a2.5 2.5 0 01-5 0v-4l-4-4v-4a2.5 2.5 0 015 0v1.5" />
        <path d="M5 19.5a2.5 2.5 0 005 0v-4l4-4v-4a2.5 2.5 0 00-5 0v1.5" />
        <path d="M10 11.5L14 7.5" />
    </svg>
);

export const MicroscopeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 100-14h-1" />
    <path d="M9 14h2" />
    <path d="M9 12a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2" />
    <path d="M12 6h.01" />
  </svg>
);

// --- Dashboard / Menu Icons ---

export const TriageIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const RecordsIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

export const GalleryIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const DemoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

export const ShareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

export const ChecklistIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const VirusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v6h-2V7zm0 8h2v2h-2v-2z" />
    </svg>
);

export const WindIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
    </svg>
);

export const BrokenBoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v16m-4-8h8" />
        <path d="M8 8l-2 2 2 2M16 8l2 2-2 2" />
    </svg>
);

export const DropletIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/.svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0L12 2.69z" />
    </svg>
);

export const CircleDotIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M12 12h.01" />
    </svg>
);

export const LinesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const StomachIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4C8.686 4 6 6.686 6 10c0 4 2 6 6 10s6-6 6-10c0-3.314-2.686-6-6-6z" />
    </svg>
);
