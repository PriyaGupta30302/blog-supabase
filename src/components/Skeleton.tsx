import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ 
  className = '', 
  variant = 'rounded',
  width,
  height 
}: SkeletonProps) {
  const variantClasses = {
    rectangle: 'rounded-none',
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  return (
    <div 
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={{ 
        width: width ?? '100%', 
        height: height ?? '1rem' 
      }}
    />
  );
}
