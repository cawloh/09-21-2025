import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = false 
}) => {
  const hoverClass = hover ? 'hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white hover:to-cream-50' : '';
  const glowClass = glow ? 'shadow-lg shadow-wine-100/50' : '';
  
  return (
    <div className={`
      bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 
      overflow-hidden transition-all duration-300 ${hoverClass} ${glowClass} ${className}
    `}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '',
  gradient = false 
}) => {
  const gradientClass = gradient ? 'bg-gradient-to-r from-wine-50 to-cream-50' : 'bg-gray-50/50';
  
  return (
    <div className={`p-6 border-b border-gray-100/50 ${gradientClass} ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent };