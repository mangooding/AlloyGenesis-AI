import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2, Sparkles, Server, Database, FileText, Cpu } from 'lucide-react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  steps: string[];
  title: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ isVisible, steps, title }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    // Simulate progress: Advance step every 1.5 - 2.5 seconds
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, steps]);

  if (!isVisible) return null;

  const getStepIcon = (index: number) => {
    if (index < currentStepIndex) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (index === currentStepIndex) return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
    return <Circle className="w-5 h-5 text-slate-600" />;
  };

  const getStepStyle = (index: number) => {
    if (index < currentStepIndex) return "text-emerald-400 font-medium opacity-70";
    if (index === currentStepIndex) return "text-white font-bold scale-105 transform transition-all";
    return "text-slate-500";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <div className="bg-slate-800 border border-indigo-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-pulse"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 border border-slate-600 shadow-inner relative">
               <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
               <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '3s' }}></div>
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
            <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">AI Processing Unit Active</p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${index === currentStepIndex ? 'bg-slate-700/40 border border-slate-600/50 shadow-lg' : ''}`}>
                <div className="shrink-0">
                  {getStepIcon(index)}
                </div>
                <div className={`text-sm tracking-wide ${getStepStyle(index)}`}>
                  {step}
                </div>
                {index === currentStepIndex && (
                  <div className="ml-auto">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-700/50">
             <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(((currentStepIndex + 0.5) / steps.length) * 100, 95)}%` }}
                ></div>
             </div>
             <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
               <span>PROCESS_ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
               <span>{(Math.min(((currentStepIndex + 0.5) / steps.length) * 100, 95)).toFixed(0)}% COMPLETE</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;