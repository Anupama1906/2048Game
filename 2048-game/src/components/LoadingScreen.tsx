import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            {/* 2x2 Grid Container */}
            <div className="relative w-32 h-32 bg-slate-300 dark:bg-slate-700 rounded-xl p-2 shadow-xl">
                {/* The Grid Background */}
                <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
                    {/* Empty cells */}
                    <div className="bg-slate-200/50 dark:bg-slate-600/50 rounded-lg" />
                    <div className="bg-slate-200/50 dark:bg-slate-600/50 rounded-lg" />
                    <div className="bg-slate-200/50 dark:bg-slate-600/50 rounded-lg" />
                    <div className="bg-slate-200/50 dark:bg-slate-600/50 rounded-lg" />
                </div>

                {/* Animated Tile Layer - Positioned absolutely over the grid */}
                <div className="absolute inset-2 pointer-events-none">
                    <div className="sliding-tile bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg flex items-center justify-center text-white font-extrabold text-sm leading-none tracking-tighter">
                        2048
                    </div>
                </div>
            </div>

            {/* Loading Text */}
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium animate-pulse">
                Loading...
            </p>

            <style>{`
        @keyframes slide-clockwise {
          /* Top Left */
          0%, 20% {
            top: 0;
            left: 0;
          }
          /* Top Right */
          25%, 45% {
            top: 0;
            left: calc(50% + 0.25rem); 
          }
          /* Bottom Right */
          50%, 70% {
            top: calc(50% + 0.25rem);
            left: calc(50% + 0.25rem);
          }
          /* Bottom Left */
          75%, 95% {
            top: calc(50% + 0.25rem);
            left: 0;
          }
          /* Return to Start */
          100% {
            top: 0;
            left: 0;
          }
        }
        
        .sliding-tile {
          /* Calculation Logic:
             We are inside a container with padding.
             The grid gap is 0.5rem. 
             So the tile width is 50% of the space minus half the gap (0.25rem).
          */
          width: calc(50% - 0.25rem);
          height: calc(50% - 0.25rem);
          position: absolute;
          animation: slide-clockwise 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;