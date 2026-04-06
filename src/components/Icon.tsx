import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | string;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 'md' }) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }[size] || size;

  return (
    <span className={`material-icons-round ${sizeClass} ${className}`}>
      {name}
    </span>
  );
};

export default Icon;