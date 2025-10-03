import React, { useEffect, useState } from 'react';
import { X, Info, Shield, Database, Brain, CheckCircle } from 'lucide-react';

interface GuidePopupProps {
  isVisible: boolean;
  onClose: () => void;
  step: 'upload' | 'init' | 'process' | 'insights' | 'complete';
  title: string;
  description: string;
}

const stepIcons = {
  upload: Shield,
  init: Database,
  process: Database,
  insights: Brain,
  complete: CheckCircle,
};

const stepColors = {
  upload: 'from-green-500 to-emerald-600',
  init: 'from-blue-500 to-indigo-600',
  process: 'from-purple-500 to-violet-600',
  insights: 'from-orange-500 to-amber-600',
  complete: 'from-green-500 to-emerald-600',
};

export const GuidePopup: React.FC<GuidePopupProps> = ({
  isVisible,
  onClose,
  step,
  title,
  description,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  if (!isVisible) return null;

  const IconComponent = stepIcons[step];
  const colorClass = stepColors[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${colorClass} p-6 rounded-t-2xl text-white relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-white/80 text-sm">Step Guide</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-6">
            {description}
          </p>
          
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className={`bg-gradient-to-r ${colorClass} text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium`}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};