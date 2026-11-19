import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioService } from '@/services/audioService';

interface AudioNarrationButtonProps {
  textToSpeak: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioNarrationButton: React.FC<AudioNarrationButtonProps> = ({
  textToSpeak,
  className = '',
  size = 'md'
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioService.speak(textToSpeak, () => {
        setIsSpeaking(false);
      });
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      title={isSpeaking ? 'Parar leitura' : 'Ouvir instrução com carinho'}
      aria-label="Ouvir instrução falada"
      className={`inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
        isSpeaking
          ? 'bg-[#7047E8] border-[#522BBF] text-white animate-pulse shadow-tactile'
          : 'bg-[#F5F3FC] dark:bg-[#27234D] border-[#DDD6F3] dark:border-[#38316B] text-[#7047E8] dark:text-[#C4B5FD] hover:bg-[#EDE9FE] dark:hover:bg-[#312B5C] hover:scale-105'
      } ${sizeClasses[size]} ${className}`}
    >
      {isSpeaking ? <VolumeX size={iconSizes[size]} /> : <Volume2 size={iconSizes[size]} />}
    </button>
  );
};
