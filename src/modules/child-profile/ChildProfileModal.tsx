import React, { useState, useEffect } from 'react';
import { ChildProfile, AgeGroup, SkillArea } from '@/types';
import { Button } from '@/components/common/Button';
import { EliteInput, EliteSelect } from '@/design-system/EliteForms';
import { X, Check, Trash2 } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { KID_CHARACTERS, getKidCharacter } from '@/data/charactersData';
import { getSkillAreaIcon } from '@/components/illustrations/CustomIcons';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: ChildProfile) => void;
  onDelete?: (id: string) => void;
  initialProfile?: ChildProfile | null;
}

const SKILL_OPTIONS: { area: SkillArea; label: string }[] = [
  { area: 'communication', label: 'Comunicação e Fala' },
  { area: 'reasoning', label: 'Aprendizado e Raciocínio' },
  { area: 'math', label: 'Matemática Lúdica' },
  { area: 'attention', label: 'Atenção e Foco' },
  { area: 'emotional', label: 'Inteligência Emocional' },
  { area: 'motor', label: 'Coordenação Motora' },
  { area: 'creativity', label: 'Criatividade e Arte' },
  { area: 'knowledge', label: 'Conhecimentos Gerais' },
  { area: 'music', label: 'Música e Ritmo' },
  { area: 'languages', label: 'Inglês e Idiomas' }
];

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialProfile
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<number>(6);
  const [birthdate, setBirthdate] = useState('');
  const [avatar, setAvatar] = useState('Bia');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('4-6');
  const [targetSkills, setTargetSkills] = useState<SkillArea[]>([
    'communication',
    'reasoning',
    'attention'
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setNickname(initialProfile.nickname || '');
      setAge(initialProfile.age);
      setBirthdate(initialProfile.birthdate || '');
      setAvatar(getKidCharacter(initialProfile.avatar).name);
      setAgeGroup(initialProfile.ageGroup);
      setTargetSkills(initialProfile.targetSkills);
    } else {
      setName('');
      setNickname('');
      setAge(6);
      setBirthdate('');
      setAvatar('Bia');
      setAgeGroup('4-6');
      setTargetSkills(['communication', 'reasoning', 'attention']);
    }
    setErrorMsg('');
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const selectedCharacter = getKidCharacter(avatar);

  const handleAgeChange = (val: number) => {
    setAge(val);
    if (val <= 6) setAgeGroup('4-6');
    else if (val <= 9) setAgeGroup('7-9');
    else setAgeGroup('10-12');
  };

  const toggleSkill = (skill: SkillArea) => {
    audioService.playGentlePop();
    if (targetSkills.includes(skill)) {
      if (targetSkills.length > 1) {
        setTargetSkills(targetSkills.filter(s => s !== skill));
      }
    } else {
      setTargetSkills([...targetSkills, skill]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor, informe o nome ou apelido da criança.');
      return;
    }

    const profileToSave: ChildProfile = {
      id: initialProfile ? initialProfile.id : `child_${Date.now()}`,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      age: Number(age),
      birthdate: birthdate || undefined,
      avatar: selectedCharacter.name,
      companionId: selectedCharacter.companionId,
      ageGroup,
      targetSkills,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    audioService.playSuccess();
    onSave(profileToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25233A]/50 dark:bg-[#080616]/80 backdrop-blur-sm animate-fadeIn">
      <div className="ak-card-3d relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E1B3A] rounded-[34px] shadow-[0_24px_60px_rgba(37,35,58,0.18)] dark:shadow-[0_24px_60px_rgba(4,6,18,0.75)] p-6 sm:p-7 border-2 border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-[#F8FAFC]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#D8D2F8] flex items-center justify-center hover:bg-[#EDE9FE] dark:hover:bg-[#38316B] hover:text-[#7047E8] dark:hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="ak-sticker-badge w-14 h-14 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#7047E8] flex items-center justify-center shrink-0">
            {selectedCharacter.renderAvatar(48)}
          </div>
          <div>
            <h3 className="ak-title-display font-executive text-xl font-extrabold text-[#25233A] dark:text-white">
              {initialProfile ? 'Editar Perfil Infantil' : 'Criar Perfil da Criança'}
            </h3>
            <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
              Personalize personagem, idade e habilidades prioritárias
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs font-bold text-[#9F1239] dark:text-[#FDA4AF] bg-[#FFF1F2] dark:bg-[#4C1D24] p-3 rounded-xl border border-[#FECDD3] dark:border-[#9F1239]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Vector Character Picker (7.0 Approved) */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#5A6D91] dark:text-[#CBD5E1] mb-2">
              Escolha o Personagem da Criança
            </label>
            <div className="grid grid-cols-3 gap-2">
              {KID_CHARACTERS.map(ch => {
                const isSelected = selectedCharacter.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setAvatar(ch.name);
                      audioService.playGentlePop();
                    }}
                    className={`btn-elite p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-[#EDF7FF] dark:bg-[#312566] border-[#2D9CDB] dark:border-[#7C6BFF] shadow-xs scale-[1.02]'
                        : 'bg-[#F5F3FC] dark:bg-[#121024] border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8]/60 dark:hover:border-[#7047E8]/70'
                    }`}
                  >
                    {ch.renderAvatar(44)}
                    <span className="text-xs font-extrabold text-[#25233A] dark:text-white">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EliteInput
              label="Nome da Criança *"
              size="sm"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Sofia"
              required
            />
            <EliteInput
              label="Apelido (Opcional)"
              size="sm"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Ex: Sofi"
            />
          </div>

          {/* Age and Age Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EliteInput
              label="Idade"
              size="sm"
              type="number"
              min={4}
              max={12}
              value={age}
              onChange={e => handleAgeChange(Number(e.target.value))}
            />
            <EliteSelect
              label="Faixa Etária da Trilha"
              value={ageGroup}
              onChange={val => setAgeGroup(val as AgeGroup)}
              options={[
                { value: '4-6', label: '4 a 6 anos (Lúdico e Visual)' },
                { value: '7-9', label: '7 a 9 anos (Alfabetização e Lógica)' },
                { value: '10-12', label: '10 a 12 anos (Autonomia e Foco)' }
              ]}
            />
          </div>

          {/* Target Skills */}
          <div>
            <label className="block text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC] mb-1.5">
              Habilidades Prioritárias:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SKILL_OPTIONS.map(opt => {
                const isChecked = targetSkills.includes(opt.area);
                return (
                  <button
                    key={opt.area}
                    type="button"
                    onClick={() => toggleSkill(opt.area)}
                    className={`btn-elite p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between border-2 ${
                      isChecked
                        ? 'bg-[#F3EFFF] dark:bg-[#27234D] border-[#7047E8] dark:border-[#8B68F7] text-[#25233A] dark:text-white'
                        : 'bg-[#F5F3FC] dark:bg-[#121024] border-[#E4DFF5] dark:border-[#38316B] text-[#77758A] dark:text-[#C5BFE6] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getSkillAreaIcon(opt.area, 'w-5 h-5 shrink-0')}
                      <span>{opt.label}</span>
                    </span>
                    {isChecked && <Check size={16} className="text-[#1E82CE] dark:text-[#A78BFA]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E4DFF5] dark:border-[#38316B]">
            {initialProfile && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                leftIcon={<Trash2 size={15} />}
                onClick={() => {
                  if (confirm(`Excluir o perfil de ${initialProfile.name}?`)) {
                    onDelete(initialProfile.id);
                    onClose();
                  }
                }}
              >
                Excluir
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button type="button" variant="cancel" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md">
                Salvar Perfil
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
