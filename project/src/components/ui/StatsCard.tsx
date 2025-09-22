import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  gradient?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
  gradient = false,
}) => {
  const gradientClass = gradient 
    ? 'bg-gradient-to-br from-wine-50 to-cream-50 border-wine-100' 
    : 'bg-white/90 border-gray-100';

  return (
    <div className={`
      ${gradientClass} backdrop-blur-sm rounded-2xl shadow-lg p-6 border 
      transition-all duration-300 hover:shadow-xl hover:scale-[1.02] 
      hover:bg-gradient-to-br hover:from-white hover:to-cream-50 
      group cursor-pointer ${className}
    `}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2 group-hover:text-gray-700 transition-colors">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-wine-700 transition-colors">
            {value}
          </p>
          
          {trend && (
            <div className="flex items-center">
              <span
                className={`text-sm font-semibold flex items-center ${
                  trend.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <svg 
                  className={`w-4 h-4 mr-1 transition-transform duration-300 ${
                    trend.positive ? 'rotate-0' : 'rotate-180'
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-wine-100 text-wine-700 group-hover:bg-wine-200 group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;