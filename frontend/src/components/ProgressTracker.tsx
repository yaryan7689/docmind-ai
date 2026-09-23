import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProgressTrackerProps {
  isLoading: boolean;
  steps: string[];
  completedLabel?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  isLoading,
  steps,
  completedLabel = 'Analysis complete',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Reset and start when loading begins
  useEffect(() => {
    if (isLoading) {
      setCurrentStep(0);
      setElapsedMs(0);
      startTimeRef.current = Date.now();

      // Advance through steps every 1.8s
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          clearInterval(intervalRef.current!);
          return prev;
        });
      }, 1800);

      // Tick elapsed time every 100ms
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      // Loading finished — jump to last step
      setCurrentStep(steps.length - 1);
      clearInterval(intervalRef.current!);
      clearInterval(timerRef.current!);
    }

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(timerRef.current!);
    };
  }, [isLoading, steps.length]);

  const elapsed = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-8">
      {/* Elapsed time */}
      <p className="text-xs font-mono text-slate-500">{elapsed}s elapsed</p>

      {/* Step list */}
      <div className="w-full max-w-xs space-y-3">
        {steps.map((step, idx) => {
          const isCompleted = !isLoading
            ? true
            : idx < currentStep;
          const isActive = isLoading && idx === currentStep;
          const isPending = isLoading && idx > currentStep;

          return (
            <div key={idx} className="flex items-center space-x-3">
              {/* Icon */}
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                {isCompleted && !isLoading ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mx-auto" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm transition-all duration-300 ${
                  isActive
                    ? 'text-slate-100 font-semibold'
                    : isCompleted
                    ? 'text-slate-400 line-through decoration-slate-600'
                    : isPending
                    ? 'text-slate-600'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>

              {/* Pulsing dot for active */}
              {isActive && (
                <span className="ml-auto flex space-x-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out rounded-full"
            style={{
              width: isLoading
                ? `${Math.round(((currentStep + 1) / steps.length) * 100)}%`
                : '100%',
            }}
          />
        </div>
        <p className="text-center text-xs text-slate-500 mt-2">
          {isLoading
            ? `Step ${currentStep + 1} of ${steps.length}`
            : completedLabel}
        </p>
      </div>
    </div>
  );
};
