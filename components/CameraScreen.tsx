import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, CameraIcon, ShutterIcon, CameraOffIcon, ArrowLeftIcon } from './IconComponents';

interface CameraScreenProps {
  onStartScan: (file: File) => void;
  error: string | null;
  isDemoMode?: boolean;
  onBackToHome?: () => void;
}

const CameraPermissionDenied: React.FC<{ onUploadClick: () => void }> = ({ onUploadClick }) => (
    <div className="flex flex-col items-center justify-center text-center bg-slate-100 p-6 rounded-2xl h-full">
        <div className="text-6xl text-red-500 mb-4">
            <CameraOffIcon />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Camera Access Denied</h3>
        <p className="text-slate-600 mt-2 mb-6 max-w-sm">
            To capture an X-ray live, this app needs camera access. Please enable camera permissions for this site in your browser's settings and refresh the page.
        </p>
        <p className="text-slate-500 mb-4 text-sm">Alternatively, you can upload an image from your device.</p>
        <button
            onClick={onUploadClick}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-full text-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
            <UploadIcon /> Upload Image File
        </button>
    </div>
);


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
        if (navigator.permissions && navigator.permissions.query) {
            const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            if (permissionStatus.state === 'denied') {
                setCameraError("Camera permission was denied. Please enable it in your browser settings.");
                return;
            }
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("This browser does not support camera access.");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(null);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
             setCameraError("Camera permission was denied. Please enable it in your browser settings.");
        } else {
            setCameraError("Could not access camera. It may be in use by another application.");
        }
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
        setTimeout(() => {
            const video = videoRef.current!;
            const canvas = canvasRef.current!;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(blob => {
                if (blob) {
                    const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setFile(capturedFile);
                    setImagePreview(URL.createObjectURL(capturedFile));
                }
                setIsCapturing(false);
            }, 'image/jpeg');
        }, 100);
    }
  };

  const handleScan = () => {
    if (file) {
      onStartScan(file);
    }
  };

  if (cameraError && !imagePreview) {
    return (
      <div className="text-center flex flex-col h-full">
          <h2 className="text-2xl font-bold text-slate-800">Camera Unavailable</h2>
          <p className="text-slate-500 mb-4">Live capture requires camera permission.</p>
          <div className="flex-grow my-4">
              <CameraPermissionDenied onUploadClick={() => fileInputRef.current?.click()} />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>
    );
  }

  const hasLiveFeed = !cameraError && !imagePreview;

  return (
    <div className="text-center flex flex-col h-full">
      {isDemoMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-4 text-left" role="alert">
              <p className="font-bold">Demo Mode</p>
              <p className="text-sm">You are in Demo Mode. The analysis will be performed by the live Gemini AI, but the result cannot be saved to patient records.</p>
          </div>
      )}
      <h2 className="text-2xl font-bold text-slate-800">Position Chest X-ray</h2>
      <p className="text-slate-500 mb-4">{hasLiveFeed ? 'Capture the X-ray image using the camera.' : 'Review the image or upload another.'}</p>
      
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg my-4">{error}</p>}
      
      <div className="camera-preview flex-grow w-full bg-slate-900 rounded-2xl my-4 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300 overflow-hidden relative">
        {imagePreview && <img src={imagePreview} alt="X-ray preview" className="object-contain h-full w-full" />}
        {hasLiveFeed && <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover"></video>}
        {hasLiveFeed && (
             <div className="absolute inset-0 border-8 border-white/50 rounded-2xl m-4 pointer-events-none"></div>
        )}
        {!hasLiveFeed && !imagePreview && (
            <div className="flex flex-col items-center text-slate-400 p-4">
                <CameraOffIcon />
                <span className="mt-2 text-sm">Live camera unavailable.</span>
            </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <div className="grid grid-cols-5 gap-4 items-center">
        <button 
            className="col-span-1 text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold p-3 rounded-full flex items-center justify-center w-full aspect-square transition-colors" 
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload File"
        >
          <UploadIcon />
        </button>

        <div className="col-span-3">
        {imagePreview ? (
            <button onClick={handleScan} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-full text-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                <CameraIcon /> Analyze Image
            </button>
        ) : (
            <button onClick={handleCapture} disabled={!!cameraError || isCapturing} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-full text-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95">
                {isCapturing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Capturing...
                    </>
                ) : (
                    <>
                        <ShutterIcon /> Capture
                    </>
                )}
            </button>
        )}
        </div>
        {/* Empty col for spacing */}
        <div className="col-span-1"></div>
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

export default CameraScreen;