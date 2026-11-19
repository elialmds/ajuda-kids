import React from 'react';
import { useApp } from '@/modules/context/AppContext';
import { ChildProfile } from '@/types';
import { Button } from '@/components/common/Button';
import { X, Plus, Check } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { getKidCharacter } from '@/data/charactersData';

interface ProfileSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProfile: () => void;
}

export const ProfileSelectModal: React.FC<ProfileSelectModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateProfile
}) => {
  const { childrenList, activeChild, setActiveChild } = useApp();

  if (!isOpen) return null;

  const handleSelect = (child: ChildProfile) => {
    audioService.playGentlePop();
    setActiveChild(child);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121024]/55 dark:bg-[#080614]/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#F8F7FF] rounded-[32px] ak-card-3d p-6 border-2 border-[#E4DFF5] dark:border-[#38316B]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] text-[#77758A] dark:text-[#B8B3D6] flex items-center justify-center hover:bg-[#EDE9FE] dark:hover:bg-[#38316B] hover:text-[#25233A] dark:hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="font-display text-xl font-bold mb-1 text-[#25233A] dark:text-white">
          Quem vai aprender hoje?
        </h3>
        <p className="text-xs font-semibold text-[#77758A] dark:text-[#B8B3D6] mb-5">
          Selecione o perfil da criança para carregar sua jornada personalizada:
        </p>

        <div className="space-y-2.5 max-h-64 overflow-y-auto mb-4 pr-1">
          {childrenList.map(child => {
            const isSelected = activeChild?.id === child.id;
            const char = getKidCharacter(child.avatar);
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => handleSelect(child)}
                className={`btn-elite w-full p-3.5 rounded-2xl flex items-center justify-between border-2 ${
                  isSelected
                    ? 'border-[#7047E8] dark:border-[#8B6CF2] bg-[#F5F3FC] dark:bg-[#2A225C] shadow-xs'
                    : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#FAF9FE] dark:bg-[#171430] hover:border-[#B5A3F2] dark:hover:border-[#7047E8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{char.renderAvatar(44)}</div>
                  <div className="text-left">
                    <h4 className="font-display font-bold text-sm text-[#25233A] dark:text-white">
                      {child.nickname || child.name}
                    </h4>
                    <span className="text-[11px] font-bold text-[#7047E8] dark:text-[#C4B5FD]">
                      {child.age} anos • Grupo {child.ageGroup}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-[#7047E8] text-white flex items-center justify-center">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="md"
          className="w-full border-dashed"
          leftIcon={<Plus size={16} />}
          onClick={() => {
            onClose();
            onOpenCreateProfile();
          }}
        >
          Cadastrar Nova Criança
        </Button>
      </div>
    </div>
  );
};
