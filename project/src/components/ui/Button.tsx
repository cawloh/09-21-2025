import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  loading = false,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "relative rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-95 overflow-hidden";
  
  const variantClasses = {
    primary: `bg-wine-gradient text-white shadow-lg hover:shadow-xl focus:ring-wine-500 
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
              before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]
              ${glow ? 'shadow-wine-200/50' : ''}`,
    secondary: `bg-gold-gradient text-white shadow-lg hover:shadow-xl focus:ring-gold-400
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
                before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]
                ${glow ? 'shadow-gold-200/50' : ''}`,
    outline: `bg-white/80 backdrop-blur-sm border-2 border-wine-700 text-wine-700 hover:bg-wine-700 hover:text-white 
              focus:ring-wine-500 shadow-md hover:shadow-lg transition-all duration-300`,
    danger: `bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500
             before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
             before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]`,
    ghost: "bg-transparent text-wine-700 hover:bg-wine-50 hover:text-wine-800 focus:ring-wine-500 transition-all duration-300"
  };
  
  const sizeClasses = {
    sm: "text-sm px-4 py-2",
    md: "px-6 py-3",
    lg: "text-lg px-8 py-4",
    xl: "text-xl px-10 py-5"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled || loading ? "opacity-50 cursor-not-allowed transform-none" : "hover:scale-105";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default Button;