import React, { useState, useRef, useEffect } from 'react';

interface ImageZoomProps {
  src: string;
  onClose: () => void;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });
  const dist = useRef(0);

  const getDistance = (touches: React.TouchList | TouchList) => {
    return Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    lastPosition.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
        isDragging.current = true;
        startPos.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
        lastPosition.current = { ...position };
    } else if (e.touches.length === 2) {
        dist.current = getDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current) {
        const newX = e.touches[0].clientX - startPos.current.x;
        const newY = e.touches[0].clientY - startPos.current.y;
        setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 2) {
        const newDist = getDistance(e.touches);
        const newScale = scale * (newDist / dist.current);
        setScale(Math.min(Math.max(0.5, newScale), 5));
        dist.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = scale - e.deltaY * 0.001;
    setScale(Math.min(Math.max(0.5, newScale), 5));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => { isDragging.current = false; };
    const handleTouchEndGlobal = () => { isDragging.current = false; };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('touchend', handleTouchEndGlobal);
    return () => {
        window.removeEventListener('mouseup', handleMouseUpGlobal);
        window.removeEventListener('touchend', handleTouchEndGlobal);
    };
  }, []);

  return (
    <div 
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center touch-none"
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        <img
          src={src}
          alt="X-ray full view"
          className="max-w-[90vw] max-h-[90vh] transition-transform duration-100 cursor-grab active:cursor-grabbing"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        />
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 5))} className="bg-white/20 text-white w-10 h-10 rounded-full hover:bg-white/30 transition-colors text-lg font-bold">+</button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="bg-white/20 text-white w-10 h-10 rounded-full hover:bg-white/30 transition-colors text-lg font-bold">-</button>
      </div>
       <button onClick={onClose} className="absolute top-4 left-4 bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors">Close</button>
       <button onClick={resetZoom} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors">Reset View</button>
    </div>
  );
};

export default ImageZoom;
