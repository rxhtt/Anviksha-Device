
import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, CameraIcon, CameraOffIcon, ArrowLeftIcon, RetakeIcon, RecordsIcon } from './IconComponents.tsx';

interface CameraScreenProps {
  onStartScan: (file: File) => void;
  error: string | null;
  onBackToHome?: () => void;
  instructionText?: string; 
  title?: string; 
  modality?: string;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onStartScan, error, onBackToHome, instructionText = "Align document or area within frame", title = "Scan" }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      if (file) return; // Don't start camera if a file is already selected

      try {
        setCameraError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error("Camera API not available.");
        }

        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError("Camera access was denied.");
        } else if (err.name === 'NotFoundError') {
             setCameraError("No camera device found.");
        } else {
            setCameraError("Unable to access camera.");
        }
      }
    };
    
    if (!imagePreview && !file) enableCamera();
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [imagePreview, file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      if (selectedFile.type === 'application/pdf') {
          setIsPdf(true);
          setImagePreview('pdf_placeholder');
      } else if (selectedFile.type.startsWith('image/')) {
          setIsPdf(false);
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            if (blob) {
                const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                setFile(capturedFile);
                setIsPdf(false);
                setImagePreview(URL.createObjectURL(capturedFile));
            }
        }, 'image/jpeg', 0.95);
    }
  };
  
  const handleRetake = () => { 
      setImagePreview(null); 
      setFile(null); 
      setIsPdf(false);
  }
  const handleScan = () => { if (file) onStartScan(file); };

  return (
    <div className="flex flex-col h-full bg-black text-white -m-5 rounded-none sm:rounded-[2.5rem] overflow-hidden relative">
     
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {imagePreview ? (
            isPdf ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl mb-4">
                        <RecordsIcon />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{file?.name}</h3>
                    <p className="text-slate-400 text-sm">PDF Document Ready for Analysis</p>
                </div>
            ) : (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
            )
        ) : (
            <>
                {cameraError ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center h-full w-full max-w-md mx-auto animate-fadeIn z-20">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400 border-2 border-slate-700 shadow-2xl">
                            <CameraOffIcon />
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-2">{cameraError}</h3>
                        <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed max-w-xs mx-auto">
                            Please allow camera permissions or upload a file.
                        </p>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-3 group transform active:scale-95"
                        >
                           <div className="bg-white/20 p-1.5 rounded-full"><UploadIcon /></div>
                           Upload File / PDF
                        </button>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                
                {!cameraError && !imagePreview && (
                   <div className="absolute inset-0 pointer-events-none opacity-20">
                       <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                           <div className="border-r border-b border-white"></div>
                           <div className="border-r border-b border-white"></div>
                           <div className="border-b border-white"></div>
                           <div className="border-r border-b border-white"></div>
                           <div className="border-r border-b border-white"></div>
                           <div className="border-b border-white"></div>
                           <div className="border-r border-white"></div>
                           <div className="border-r border-white"></div>
                           <div></div>
                       </div>
                   </div>
                )}
            </>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />

      <div className="h-48 bg-black/80 backdrop-blur-xl flex flex-col justify-center px-8 pb-6 pt-2 border-t border-white/10">
         <div className="flex items-center justify-between max-w-md mx-auto w-full">
            
            <div className="w-16 flex justify-center">
                {imagePreview ? (
                    <button onClick={handleRetake} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                         <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center"><RetakeIcon /></div>
                         <span className="text-[10px] font-bold uppercase">Retake</span>
                    </button>
                ) : (
                    !cameraError && (
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                            <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center"><UploadIcon /></div>
                            <span className="text-[10px] font-bold uppercase">Upload</span>
                        </button>
                    )
                )}
            </div>

            <div className="flex items-center justify-center">
                {file ? (
                    <button onClick={handleScan} className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 transition-transform animate-pulse">
                         {isPdf ? <div className="text-white font-bold text-xs">ANALYZE</div> : <div className="text-white text-3xl"><CameraIcon /></div>}
                    </button>
                ) : (
                     !cameraError && (
                        <button 
                            onClick={handleCapture} 
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform group"
                        >
                            <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform"></div>
                        </button>
                    )
                )}
            </div>

             <div className="w-16 flex justify-center">
                <button onClick={onBackToHome} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    <div className="w-12 h-12 rounded-full bg-transparent border border-white/10 flex items-center justify-center hover:bg-white/10">
                        <ArrowLeftIcon />
                    </div>
                    <span className="text-[10px] font-bold uppercase">Cancel</span>
                </button>
            </div>
         </div>
         {error && <div className="text-center text-red-400 text-xs font-bold mt-3 bg-red-500/10 py-1 rounded-lg">{error}</div>}
      </div>
    </div>
  );
};

export default CameraScreen;
