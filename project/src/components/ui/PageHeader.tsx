import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-wine-700 to-purple-700 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="animate-slide-up">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;