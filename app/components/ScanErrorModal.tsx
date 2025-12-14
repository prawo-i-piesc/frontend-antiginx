"use client";

interface ScanErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

export default function ScanErrorModal({ isOpen, onClose, error }: ScanErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800/50 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Error</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-zinc-400 hover:text-white"></i>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0 border border-red-600/30">
              <i className="ri-error-warning-line text-red-400 text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-zinc-300">{error}</p>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-end mt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-700/50 transition-all font-medium text-sm border border-zinc-700/50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
