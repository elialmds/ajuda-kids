import React from 'react';
import { Loader2 } from 'lucide-react';
import { audioService } from '@/services/audioService';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'soft'
  | 'subtle'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'destructive'
  | 'confirm'
  | 'cancel';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withSound?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  withSound = true,
  isLoading = false,
  leftIcon,
  rightIcon,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = Boolean(disabled || isLoading);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withSound && !isDisabled) {
      audioService.playGentlePop();
    }
    onClick?.(e);
  };

  const baseStyles =
    'btn-elite inline-flex items-center justify-center font-display font-extrabold rounded-[18px] select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7047E8]/35 focus-visible:ring-offset-2 whitespace-nowrap';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[#7047E8] dark:bg-[#7047E8] text-white hover:bg-[#5E35D8] dark:hover:bg-[#7F59EE] border-b-[3px] border-[#4E28B8] dark:border-[#4924AD] shadow-sm shadow-[#7047E8]/25',
    secondary:
      'bg-[#4389F5] dark:bg-[#FF9B42] text-white dark:text-[#121024] hover:bg-[#3178E6] dark:hover:bg-[#FFA95C] border-b-[3px] border-[#2563C8] dark:border-[#D97820] shadow-sm shadow-[#4389F5]/20',
    accent:
      'bg-[#FFD34E] text-[#25233A] hover:bg-[#F7C536] border-b-[3px] border-[#D4A017] shadow-sm shadow-[#FFD34E]/30',
    confirm:
      'bg-[#36C995] text-white dark:text-[#0F241D] hover:bg-[#29B683] border-b-[3px] border-[#21996E] shadow-sm shadow-[#36C995]/25',
    soft:
      'bg-[#EFEAFC] dark:bg-[#27234D] text-[#5B35C9] dark:text-[#C7B8FF] hover:bg-[#E3DAFA] dark:hover:bg-[#322D61] border border-[#D8CCFA] dark:border-[#38316B]',
    subtle:
      'bg-[#F5F3FC] dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#B8B3D6] hover:bg-[#EAE5F8] dark:hover:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B]',
    cancel:
      'bg-white dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#F8F7FF] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] border border-[#DFD8F5] dark:border-[#38316B]',
    outline:
      'border-2 border-[#7047E8]/35 dark:border-[#4B428A] text-[#25233A] dark:text-[#F8F7FF] bg-white dark:bg-[#1E1B3A] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D]',
    ghost:
      'text-[#4A4668] dark:text-[#B8B3D6] hover:bg-[#EFEAFC]/80 dark:hover:bg-[#27234D]',
    danger:
      'bg-[#F16E9A] text-white hover:bg-[#DF5684] border-b-[3px] border-[#B83B66] shadow-sm',
    destructive:
      'bg-[#FFF0F5] dark:bg-[#3B1B2B] text-[#C83265] dark:text-[#F9A8C6] hover:bg-[#FFE0EB] dark:hover:bg-[#4E2339] border border-[#FACBDD] dark:border-[#832B52]'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 rounded-xl gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-2xl gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-2xl gap-2.5',
    xl: 'text-base sm:text-lg px-7 py-3.5 rounded-3xl gap-3'
  };

  const disabledStyles = isDisabled
    ? 'opacity-55 cursor-not-allowed transform-none shadow-none pointer-events-none'
    : 'cursor-pointer';

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin shrink-0" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
