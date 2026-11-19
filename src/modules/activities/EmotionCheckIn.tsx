import React, { useState } from 'react';
import { EmotionType } from '@/types';
import { useApp } from '@/modules/context/AppContext';
import { Button } from '@/components/common/Button';
import { Wind, CheckCircle2 } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { EmotionSvgIcon, EmotionalSvgIcon } from '@/components/illustrations/CustomIcons';
import { StatePill } from '@/design-system/EliteCards';

interface EmotionOption {
  type: EmotionType;
  label: string;
  accentBorder: string;
  lipColor: string;
  bgColor: string;
  message: string;
  audioPrompt: string;
}

const EMOTIONS: EmotionOption[] = [
  {
    type: 'happy',
    label: 'Feliz',
    accentBorder: '#F2CA52',
    lipColor: '#D4A11B',
    bgColor: '#FFF6D1',
    message: 'Que maravilha! Aproveite essa energia boa para aprender e brincar.',
    audioPrompt: 'Que alegria ver você feliz!'
  },
  {
    type: 'calm',
    label: 'Calmo',
    accentBorder: '#7ED470',
    lipColor: '#4BA43E',
    bgColor: '#E6F9E0',
    message: 'A serenidade ajuda a nossa mente a aprender com mais foco e paz.',
    audioPrompt: 'Estar calmo é uma sensação muito gostosa.'
  },
  {
    type: 'excited',
    label: 'Animado',
    accentBorder: '#63BEF2',
    lipColor: '#2D8FD1',
    bgColor: '#E1F4FE',
    message: 'Quanta energia boa! Vamos canalizar esse entusiasmo na jornada de hoje.',
    audioPrompt: 'Uau! Que animação contagiante!'
  },
  {
    type: 'tired',
    label: 'Cansado',
    accentBorder: '#9BB9F0',
    lipColor: '#678BD0',
    bgColor: '#EDF2FE',
    message: 'Tudo bem descansar um pouquinho. Faça as atividades no seu próprio ritmo.',
    audioPrompt: 'Se estiver cansado, faça tudo bem devagarzinho.'
  },
  {
    type: 'anxious',
    label: 'Ansioso',
    accentBorder: '#F5B076',
    lipColor: '#D4833F',
    bgColor: '#FFF0E2',
    message: 'É normal sentir um friozinho na barriga. Respire devagar, você está seguro aqui.',
    audioPrompt: 'Respire fundo. Vai dar tudo certo!'
  },
  {
    type: 'sad',
    label: 'Triste',
    accentBorder: '#79B4F2',
    lipColor: '#4687CE',
    bgColor: '#E5F1FE',
    message: 'Todos nós ficamos tristes às vezes. Seus sentimentos são importantes e acolhidos.',
    audioPrompt: 'É natural sentir tristeza às vezes. Você é muito especial.'
  },
  {
    type: 'angry',
    label: 'Bravo',
    accentBorder: '#F28E9A',
    lipColor: '#D05867',
    bgColor: '#FFE8EC',
    message: 'Sentir raiva acontece. Que tal respirarmos juntos para soltar essa tensão?',
    audioPrompt: 'A raiva passa quando respiramos com calma e conversamos.'
  },
  {
    type: 'fear',
    label: 'Com medo',
    accentBorder: '#B99CF4',
    lipColor: '#8B65D4',
    bgColor: '#F3EDFE',
    message: 'O medo nos protege, mas você é forte. Pode pedir a mão de um responsável se quiser.',
    audioPrompt: 'Você é muito corajoso e nós estamos com você.'
  }
];

interface EmotionCheckInProps {
  onStartBreathing?: () => void;
}

export const EmotionCheckIn: React.FC<EmotionCheckInProps> = ({ onStartBreathing }) => {
  const { todayEmotion, recordEmotion, activeChild, isDarkMode } = useApp();
  const [selected, setSelected] = useState<EmotionType | null>(todayEmotion?.emotion || null);
  const [confirmed, setConfirmed] = useState(Boolean(todayEmotion));

  const handleSelect = (emo: EmotionOption) => {
    setSelected(emo.type);
    setConfirmed(false);
    audioService.speak(emo.audioPrompt);
    audioService.playGentlePop();
  };

  const handleConfirm = async () => {
    if (!selected) return;
    await recordEmotion(selected);
    setConfirmed(true);
    audioService.playSuccess();
  };

  const activeOption = EMOTIONS.find(e => e.type === selected);

  return (
    <div
      style={{
        boxShadow: isDarkMode
          ? '0 6px 0 #100E24, 0 14px 30px rgba(4, 3, 18, 0.5)'
          : '0 6px 0 #D5C8F5, 0 14px 28px rgba(112, 71, 232, 0.08)'
      }}
      className="rounded-[30px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-[#F8F7FF]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE8F1] dark:bg-[#3A1E33] border-2 border-[#F16E9A]/40 dark:border-[#7B3B5E] flex items-center justify-center shadow-sm shrink-0">
            <EmotionalSvgIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#25233A] dark:text-white leading-tight">
              Como estou me sentindo?
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#77758A] dark:text-[#B8B3D6]">
              {activeChild ? `Olá, ${activeChild.nickname || activeChild.name}! ` : ''}
              Conte como seu coraçãozinho está hoje:
            </p>
          </div>
        </div>
        {confirmed && <StatePill state="completed" customLabel="Registrado" />}
      </div>

      {/* Grid of Expressive 3D Vector Emotions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 my-4">
        {EMOTIONS.map(emo => {
          const isCurrent = selected === emo.type;
          return (
            <button
              key={emo.type}
              type="button"
              onClick={() => handleSelect(emo)}
              style={{
                backgroundColor: isCurrent
                  ? isDarkMode
                    ? '#2A225C'
                    : emo.bgColor
                  : isDarkMode
                  ? '#171430'
                  : '#FFFFFF',
                borderColor: isCurrent ? emo.accentBorder : isDarkMode ? '#38316B' : '#E4DFF5',
                boxShadow: isCurrent
                  ? `0 4px 0 ${isDarkMode ? '#100E24' : emo.lipColor}`
                  : isDarkMode
                  ? '0 3px 0 #0F0D24'
                  : '0 3px 0 #DDD6F3'
              }}
              className={`relative flex flex-col items-center justify-center p-3 rounded-[24px] border-2 transition-all duration-150 ${
                isCurrent
                  ? 'scale-[1.03] font-black text-[#25233A] dark:text-white ring-2 ring-[#7047E8]/30 dark:ring-[#8B6CF2]/45'
                  : 'hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] hover:border-[#B5A3F2] dark:hover:border-[#7047E8] font-extrabold text-[#25233A] dark:text-[#E2E0F8]'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#7047E8] text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={12} />
                </span>
              )}
              <EmotionSvgIcon emotion={emo.type} className="w-12 h-12 mb-1.5" />
              <span className="font-display text-xs sm:text-sm font-bold">{emo.label}</span>
            </button>
          );
        })}
      </div>

      {/* Comforting Feedback Box */}
      {activeOption && (
        <div
          style={{
            backgroundColor: isDarkMode ? '#27234D' : activeOption.bgColor,
            borderColor: activeOption.accentBorder
          }}
          className="p-4 sm:p-5 rounded-[26px] mt-4 border-2 animate-fadeIn text-[#25233A] dark:text-[#F8F7FF]"
        >
          <div className="flex items-start gap-3">
            <EmotionSvgIcon emotion={activeOption.type} className="w-12 h-12 shrink-0" />
            <div className="flex-1">
              <h4 className="font-display font-bold text-sm sm:text-base text-[#25233A] dark:text-white">
                Sentindo-se {activeOption.label}
              </h4>
              <p className="text-xs sm:text-sm text-[#57546B] dark:text-[#D3CEF0] font-semibold mt-0.5 leading-relaxed">
                {activeOption.message}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-black/10 dark:border-white/10">
            {onStartBreathing && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartBreathing}
                className="bg-white dark:bg-[#171430] border-[#DDD6F3] dark:border-[#38316B] text-xs font-black text-[#25233A] dark:text-white hover:dark:bg-[#27234D]"
              >
                <Wind size={15} />
                <span>Respiração guiada</span>
              </Button>
            )}

            {!confirmed ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                className="ml-auto"
              >
                <CheckCircle2 size={16} />
                <span>Salvar Sentimento</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-black text-[#1E6917] dark:text-[#6EE7B7] ml-auto">
                <CheckCircle2 size={16} />
                <span>Sentimento salvo para hoje!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
