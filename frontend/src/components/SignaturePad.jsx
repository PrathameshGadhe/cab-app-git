import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [signature, setSignature] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    setCtx(context);

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; // For better quality on high DPI displays
      canvas.height = rect.height * 2;
      context.scale(2, 2);
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX / 2;
    const y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY / 2;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX / 2;
    const y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY / 2;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const signatureData = canvasRef.current.toDataURL('image/png');
    setSignature(signatureData);
    if (onSave) onSave(signatureData);
  };

  const clearCanvas = () => {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignature(null);
    if (onSave) onSave(null);
  };

  return (
    <div className="signature-pad w-full">
      <div className="border rounded-lg p-4 bg-white">
        <div className="border-b border-gray-200 pb-2 mb-4">
          <h3 className="text-sm font-medium text-gray-700">Customer Signature</h3>
        </div>
        <div className="border border-gray-300 rounded-md bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-32 touch-none bg-white"
            style={{ touchAction: 'none' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs px-2 py-1 text-red-600 hover:text-red-800"
          >
            Clear Signature
          </button>
          {signature && (
            <span className="text-xs text-green-600">✓ Signed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
