import React from 'react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex flex-col items-center">
        {/* Premium Spinner */}
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        
        {/* Branding/Text */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Blog<span className="text-primary">App</span>
          </span>
        </div>
        
        {/* Subtle pulsing line */}
        <div className="w-24 h-1 bg-primary/20 rounded-full mt-4 overflow-hidden">
          <div className="w-1/2 h-full bg-primary rounded-full animate-[shimmer_1.5s_infinite_linear] bg-[length:200%_100%]"></div>
        </div>
      </div>
    </div>
  );
}


