import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Loader2, Search, X, ChevronDown, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import {
  FORM_STATE_TOKENS,
  FORM_STATE_TOKENS_DARK,
  FormFieldState,
  useDocumentDarkMode
} from '@/design-system/tokens';

/**
 * Resolve visual state across all 7 required form states:
 * normal | hover | focus | filled | invalid | disabled | loading
 */
export function resolveFormFieldState(params: {
  disabled?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  isFocused?: boolean;
  isHovered?: boolean;
  hasValue?: boolean;
}): FormFieldState {
  if (params.disabled) return 'disabled';
  if (params.isLoading) return 'loading';
  if (params.hasError) return 'invalid';
  if (params.isFocused) return 'focus';
  if (params.isHovered) return 'hover';
  if (params.hasValue) return 'filled';
  return 'normal';
}

export interface EliteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  successText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  isLoading?: boolean;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EliteInput = React.forwardRef<HTMLInputElement, EliteInputProps>(
  (
    {
      label,
      hint,
      error,
      successText,
      leftIcon,
      rightElement,
      isLoading = false,
      disabled = false,
      type = 'text',
      value,
      defaultValue,
      className = '',
      containerClassName = '',
      size = 'md',
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isDark = useDocumentDarkMode();

    const hasValue =
      value !== undefined ? String(value).trim().length > 0 : Boolean(defaultValue);
    const visualState = resolveFormFieldState({
      disabled,
      isLoading,
      hasError: Boolean(error),
      isFocused,
      isHovered,
      hasValue
    });
    const styleToken = (isDark ? FORM_STATE_TOKENS_DARK : FORM_STATE_TOKENS)[visualState];
    const isPassword = type === 'password';
    const effectiveType = isPassword && showPassword ? 'text' : type;

    const sizeClasses =
      size === 'sm'
        ? 'py-2 text-xs rounded-xl'
        : size === 'lg'
        ? 'py-3.5 text-sm sm:text-base rounded-2xl'
        : 'py-2.5 sm:py-3 text-sm rounded-2xl';

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <div className="flex items-center justify-between gap-2 px-0.5">
            <label className="block text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC] tracking-tight">
              {label}
            </label>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E82CE] dark:text-[#60A5FA]">
                <Loader2 size={11} className="animate-spin" />
                Validando...
              </span>
            )}
          </div>
        )}

        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            borderColor: styleToken.borderColor,
            backgroundColor: styleToken.backgroundColor,
            boxShadow: styleToken.ringShadow
          }}
          className={`input-elite relative flex items-center border-[1.5px] transition-all ${sizeClasses} ${
            disabled ? 'cursor-not-allowed opacity-75' : ''
          }`}
        >
          {leftIcon && (
            <span className="pl-3.5 pr-1 text-[#5A6D91] dark:text-[#94A3B8] shrink-0 flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            type={effectiveType}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled || isLoading}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            style={{ color: styleToken.textColor }}
            className={`w-full bg-transparent outline-none font-bold placeholder:font-medium placeholder:text-[#8A9BB8] dark:placeholder:text-[#64748B] ${
              leftIcon ? 'pl-1.5' : 'pl-3.5'
            } ${isPassword || rightElement || isLoading ? 'pr-10' : 'pr-3.5'} ${className}`}
            {...rest}
          />

          <div className="pr-3 flex items-center gap-1.5 shrink-0">
            {isLoading && <Loader2 size={16} className="animate-spin text-[#2D9CDB] dark:text-[#60A5FA]" />}
            {isPassword && !isLoading && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="p-1 rounded-lg text-[#77758A] dark:text-[#C5BFE6] hover:text-[#25233A] dark:hover:text-white hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            {!isLoading && rightElement}
          </div>
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#BE123C] dark:text-[#FDA4AF] px-0.5 animate-fadeIn">
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : successText ? (
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E6917] dark:text-[#4ADE80] px-0.5 animate-fadeIn">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>{successText}</span>
          </p>
        ) : hint ? (
          <p className="text-[11px] font-semibold text-[#5A6D91] dark:text-[#CBD5E1] px-0.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);

EliteInput.displayName = 'EliteInput';

export interface EliteSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EliteSearchInput: React.FC<EliteSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = ''
}) => {
  return (
    <EliteInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size="sm"
      containerClassName={className}
      leftIcon={<Search size={15} className="text-[#4A90B8]" />}
      rightElement={
        value.trim().length > 0 ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Limpar busca"
            className="p-1 rounded-full bg-[#EAF3FB] text-[#33466E] hover:bg-[#D5E9FA] transition-colors"
          >
            <X size={12} />
          </button>
        ) : undefined
      }
    />
  );
};

export interface EliteSelectOption {
  value: string;
  label: string;
}

export interface EliteSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: EliteSelectOption[];
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  className?: string;
}

export const EliteSelect: React.FC<EliteSelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  leftIcon,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = useDocumentDarkMode();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const visualState = resolveFormFieldState({
    disabled,
    hasError: Boolean(error),
    isFocused: isOpen,
    isHovered,
    hasValue: Boolean(value)
  });
  const styleToken = (isDark ? FORM_STATE_TOKENS_DARK : FORM_STATE_TOKENS)[visualState];

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC] px-0.5">
          {label}
        </label>
      )}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        style={{
          borderColor: styleToken.borderColor,
          backgroundColor: styleToken.backgroundColor,
          color: styleToken.textColor,
          boxShadow: styleToken.ringShadow
        }}
        className="input-elite w-full flex items-center justify-between gap-2.5 rounded-2xl border-[1.5px] py-2.5 sm:py-3 px-3.5 text-xs sm:text-sm font-extrabold outline-none cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <span className="flex items-center gap-2 min-w-0">
          {leftIcon && <span className="text-[#4A90B8] dark:text-[#60A5FA] shrink-0">{leftIcon}</span>}
          <span className="truncate whitespace-nowrap text-left">{selectedOption?.label || ''}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#5A6D91] dark:text-[#CBD5E1] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#1971C2] dark:text-[#FF9900]' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <ul
          role="listbox"
          aria-label={label || 'Opções'}
          className="absolute right-0 sm:left-0 mt-1.5 z-50 min-w-full w-max max-w-[280px] max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] p-1.5 shadow-[0_12px_30px_rgba(37,35,58,0.12)] dark:shadow-[0_14px_34px_rgba(4,6,18,0.75)] space-y-0.5 animate-fadeIn"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-extrabold transition-colors ${
                    isSelected
                      ? 'bg-[#F3EFFF] dark:bg-[#38316B] text-[#7047E8] dark:text-[#E9D5FF]'
                      : 'text-[#25233A] dark:text-[#F8FAFC] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-[#7047E8] dark:text-[#C4B5FD]" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="text-[11px] font-bold text-[#BE123C] dark:text-[#FDA4AF] px-0.5">{error}</p>
      )}
    </div>
  );
};

export interface EliteToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const EliteToggle: React.FC<EliteToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 text-left ${
        checked
          ? 'bg-[#F3EFFF] dark:bg-[#27234D] border-[#7047E8]/60 dark:border-[#8B68F7]/70'
          : 'bg-[#F5F3FC] dark:bg-[#121024] border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8]/40 dark:hover:border-[#7047E8]/60'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="min-w-0 flex-1">
        <span className="text-sm font-extrabold text-[#25233A] dark:text-[#F8FAFC] block">{label}</span>
        {description && (
          <span className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6] block mt-0.5 leading-relaxed">
            {description}
          </span>
        )}
      </div>

      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors duration-200 ${
          checked
            ? 'bg-[#7047E8] dark:bg-[#7047E8] border-[#522BBF] dark:border-[#8B68F7]'
            : 'bg-[#DDD6F3] dark:bg-[#27234D] border-[#C4B5FD] dark:border-[#38316B]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
};

export interface EliteRangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  recommendedLabel?: string;
  onChange: (val: number) => void;
}

export const EliteRangeSlider: React.FC<EliteRangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 5,
  unit = 'min',
  recommendedLabel,
  onChange
}) => {
  const isDark = useDocumentDarkMode();
  const percent = Math.round(((value - min) / (max - min)) * 100);
  const trackIdle = isDark ? '#38316B' : '#E4DFF5';
  const trackActive = isDark ? '#8B68F7' : '#7047E8';

  return (
    <div className="p-4 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] space-y-3 transition-colors">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC] block">{label}</span>
          {recommendedLabel && (
            <span className="text-[11px] font-semibold text-[#77758A] dark:text-[#C5BFE6] block mt-0.5">
              {recommendedLabel}
            </span>
          )}
        </div>
        <span className="px-3 py-1 rounded-full bg-[#7047E8] text-white text-xs font-extrabold tabular-nums shadow-sm">
          {value} {unit} / dia
        </span>
      </div>

      <div className="relative pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${trackActive} 0%, ${trackActive} ${percent}%, ${trackIdle} ${percent}%, ${trackIdle} 100%)`
          }}
          className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-[#7047E8] dark:accent-[#FFD34E]"
        />
        <div className="flex justify-between text-[10px] font-bold text-[#77758A] dark:text-[#C5BFE6] tabular-nums mt-1.5">
          <span>
            {min} {unit}
          </span>
          <span className="text-[#1E7E5B] dark:text-[#4ADE80]">Ideal: 20–30 {unit}</span>
          <span>
            {max} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export interface SegmentedOption {
  id: string;
  label: string;
  count?: number;
}

export const EliteSegmentedControl: React.FC<{
  options: SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ options, value, onChange, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] overflow-x-auto max-w-full ${className}`}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              active
                ? 'bg-white dark:bg-[#27234D] text-[#7047E8] dark:text-white shadow-sm border border-[#DDD6F3] dark:border-[#7047E8]/70'
                : 'text-[#77758A] dark:text-[#A59EC9] hover:text-[#25233A] dark:hover:text-white'
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                  active
                    ? 'bg-[#F3EFFF] dark:bg-[#7047E8] text-[#7047E8] dark:text-white'
                    : 'bg-white/80 dark:bg-[#1E1B3A] text-[#77758A] dark:text-[#C5BFE6]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
