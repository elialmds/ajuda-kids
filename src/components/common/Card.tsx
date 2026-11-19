import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'soft-blue' | 'soft-green' | 'soft-yellow' | 'soft-purple';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  hoverable = false,
  className = '',
  ...props
}) => {
  const variants = {
    white: 'bg-white dark:bg-[#1E1B3A]/95 border-2 border-[#E4DFF5] dark:border-[#38316B] ak-card-3d text-[#25233A] dark:text-[#F8F7FF]',
    'soft-blue': 'bg-[#EDF5FF] dark:bg-[#1E244D]/90 border-2 border-[#C5DEFF] dark:border-[#384B8A] text-[#25233A] dark:text-[#F8F7FF]',
    'soft-green': 'bg-[#E9F9F0] dark:bg-[#162C36]/90 border-2 border-[#A7F3D0] dark:border-[#246952] text-[#0E6B4B] dark:text-[#A7F3D0]',
    'soft-yellow': 'bg-[#FFF9E6] dark:bg-[#2B2336]/90 border-2 border-[#FDE68A] dark:border-[#6B541A] text-[#8A5A00] dark:text-[#FDE68A]',
    'soft-purple': 'bg-[#F5F3FC] dark:bg-[#27234D]/90 border-2 border-[#DDD6F3] dark:border-[#4A3F8A] text-[#4B2FB8] dark:text-[#DDD6FE]'
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-hover cursor-pointer active:scale-[0.99]'
    : '';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-colors duration-200 ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
