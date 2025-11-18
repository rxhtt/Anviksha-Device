
import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, CameraIcon, ShutterIcon, CameraOffIcon, ArrowLeftIcon, RetakeIcon } from './IconComponents.tsx';

interface CameraScreenProps {
  onStartScan: (file: File) => void;
  error: string | null;
  isDemoMode?: boolean;
  onBackToHome?: () => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onStartScan, error, isDemoMode = false, onBackToHome }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(null);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("Camera unavailable. Please use upload.");
      }
    };
    
    if (!imagePreview) {
      enableCamera();
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [imagePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        setIsCapturing(true);
        // Simulate shutter lag for realism
        setTimeout(() => {
            const video = videoRef.current!;
            const canvas = canvasRef.current!;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            canvas.toBlob(blob => {
                if (blob) {
                    const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setFile(capturedFile);
                    setImagePreview(URL.createObjectURL(capturedFile));
                }
                setIsCapturing(false);
            }, 'image/jpeg', 0.95);
        }, 150);
    }
  };
  
  const handleRetake = () => {
    setImagePreview(null);
    setFile(null);
  }

  const handleScan = () => {
    if (file) onStartScan(file);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white -m-5 rounded-none sm:rounded-[2.5rem] overflow-hidden relative">
      {isDemoMode && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-yellow-400/90 text-black text-xs font-bold px-3 py-2 rounded-full text-center backdrop-blur-md">
              Demo Mode Active
          </div>
      )}

      {/* Viewfinder Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
        ) : (
            <>
                {cameraError ? (
                    <div className="flex flex-col items-center text-slate-500">
                        <CameraOffIcon />
                        <span className="mt-2 text-sm">{cameraError}</span>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                {/* Grid Overlay */}
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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* Controls */}
      <div className="h-48 bg-black/80 backdrop-blur-xl flex flex-col justify-center px-8 pb-6 pt-2">
         <div className="flex items-center justify-between max-w-md mx-auto w-full">
            {/* Left Action: Gallery/Retake */}
            <div>
                {imagePreview ? (
                    <button onClick={handleRetake} className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                        <RetakeIcon />
                    </button>
                ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                        <UploadIcon />
                    </button>
                )}
            </div>

            {/* Center Action: Shutter/Confirm */}
            <div className="flex items-center justify-center">
                {imagePreview ? (
                    <button onClick={handleScan} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                         <div className="text-black text-2xl"><CameraIcon /></div>
                    </button>
                ) : (
                    <button 
                        onClick={handleCapture} 
                        disabled={!!cameraError}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform"></div>
                    </button>
                )}
            </div>

            {/* Right Action: Back */}
             <div>
                <button onClick={onBackToHome} className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeftIcon />
                </button>
            </div>
         </div>
         {imagePreview && <div className="text-center text-white/60 text-xs font-medium mt-4">Review Photo</div>}
      </div>
    </div>
  );
};

export default CameraScreen;
