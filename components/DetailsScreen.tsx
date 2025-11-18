import React from 'react';
import { 
    ArrowLeftIcon,
    CheckCircleIcon, VirusIcon, LungsIcon, LinesIcon, HeartIcon, DropletIcon, 
    CircleDotIcon, WindIcon, BrokenBoneIcon, StomachIcon 
} from './IconComponents';

interface DetailsScreenProps {
  onBack?: () => void; // Optional as it's now handled by header
}

const conditions = [
    { name: "Normal", description: "No significant abnormalities detected.", icon: <CheckCircleIcon /> },
    { name: "Tuberculosis", description: "Bacterial infection causing cavitary lesions.", icon: <VirusIcon /> },
    { name: "Pneumonia", description: "Lung inflammation causing consolidation.", icon: <LungsIcon /> },
    { name: "Atelectasis", description: "Partial or complete collapse of a lung section.", icon: <LinesIcon /> },
    { name: "Cardiomegaly", description: "An enlarged heart, a sign of underlying conditions.", icon: <HeartIcon /> },
    { name: "Effusion", description: "Excess fluid between the lungs and chest cavity.", icon: <DropletIcon /> },
    { name: "Nodule/Mass", description: "A localized opacity in the lung requiring follow-up.", icon: <CircleDotIcon /> },
    { name: "Pneumothorax", description: "A collapsed lung due to air leak in the chest space.", icon: <WindIcon /> },
    { name: "Fibrosis", description: "Scarring of lung tissue, leading to breathing issues.", icon: <LinesIcon /> },
    { name: "Edema", description: "Swelling from excess fluid in lung tissues.", icon: <DropletIcon /> },
    { name: "Consolidation", description: "Lung tissue filled with fluid instead of air.", icon: <LungsIcon /> },
    { name: "Emphysema", description: "Damaged air sacs causing shortness of breath.", icon: <LungsIcon /> },
    { name: "Fracture", description: "A break in one or more rib bones.", icon: <BrokenBoneIcon /> },
    { name: "Hernia", description: "Protrusion of an organ through the diaphragm.", icon: <StomachIcon /> },
    { name: "Infiltration", description: "Abnormal substance accumulation in lung tissue.", icon: <LungsIcon /> }
];

const ConditionCard: React.FC<{ name: string, description: string, icon: React.ReactNode }> = ({ name, description, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-start gap-4">
        <div className="text-3xl text-blue-500 mt-1">
            {icon}
        </div>
        <div>
            <p className="font-bold text-slate-800">{name}</p>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
    </div>
);

const DetailsScreen: React.FC<DetailsScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800">App Capabilities</h2>
        <p className="text-slate-600 mt-2">Our AI is trained to screen for the following conditions.</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6">
        <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-lg text-slate-800 mb-2">About Anviksha AI</h3>
            <p className="text-sm text-slate-700">
                Anviksha AI provides rapid, accessible, and affordable analysis of chest X-rays using state-of-the-art artificial intelligence. Our platform empowers healthcare professionals to make faster, more informed decisions, triage patients effectively, and reduce the time and cost associated with traditional diagnostics.
            </p>
            <p className="text-xs text-slate-500 mt-3 font-semibold">
                <strong>Disclaimer:</strong> This is an assistive screening tool, not a substitute for diagnosis by a qualified medical professional.
            </p>
        </div>

         <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conditions.map((condition) => (
                    <ConditionCard key={condition.name} {...condition} />
                ))}
            </div>
         </div>
      </div>

      {onBack && (
        <div className="mt-6 text-center no-print shrink-0">
          <button
            onClick={onBack}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 mx-auto text-sm"
          >
            <ArrowLeftIcon /> Back to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailsScreen;