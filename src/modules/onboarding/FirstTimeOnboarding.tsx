import React, { useState, useEffect } from 'react';
import { ChildProfile, AgeGroup, SkillArea, FamilyAccount, ParentSettings } from '@/types';
import { KID_CHARACTERS, MUNDO_COMPANIONS } from '@/data/charactersData';
import { WelcomeIllustration, ProgressTrophyIllustration } from '@/components/illustrations/HandDrawnIllustrations';
import { storageService } from '@/services/storageService';
import { generateSalt, hashPin } from '@/utils/security';
import { audioService } from '@/services/audioService';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Smartphone,
  QrCode,
  Clock,
  Lock,
  Users,
  Heart,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FirstTimeOnboardingProps {
  onComplete: (profile: ChildProfile, family: FamilyAccount) => void;
  initialPairingCode?: string | null;
}

const SKILL_ITEMS: { area: SkillArea; label: string; companion: string; color: string; desc: string }[] = [
  {
    area: 'communication',
    label: 'Comunicação e Fala',
    companion: 'Lumi',
    color: '#C8E0F3',
    desc: 'Sons das letras, vocabulário, rimas e histórias interativas'
  },
  {
    area: 'reasoning',
    label: 'Descoberta e Raciocínio',
    companion: 'Teo',
    color: '#E5D2F4',
    desc: 'Quebra-cabeças lógicos, números, sequências e associações'
  },
  {
    area: 'attention',
    label: 'Atenção e Foco',
    companion: 'Maya',
    color: '#DDE9D2',
    desc: 'Observação cuidadosa, memória visual e foco tranquilo'
  },
  {
    area: 'emotional',
    label: 'Inteligência Emocional',
    companion: 'Sol',
    color: '#F4E9A9',
    desc: 'Reconhecimento de sentimentos, empatia e respiração serena'
  },
  {
    area: 'motor',
    label: 'Coordenação Motora',
    companion: 'Pipoca',
    color: '#F3D9DE',
    desc: 'Movimento corporal fora da tela, ritmo e lateralidade'
  },
  {
    area: 'creativity',
    label: 'Criatividade e Arte',
    companion: 'Pipoca',
    color: '#FFE7CC',
    desc: 'Desenho guiado, pintura livre no ateliê e imaginação visual'
  },
  {
    area: 'knowledge',
    label: 'Conhecimentos Gerais',
    companion: 'Kiko',
    color: '#D8F1E5',
    desc: 'Natureza, ciência divertida, planetas e curiosidades do mundo'
  },
  {
    area: 'math',
    label: 'Matemática Lúdica',
    companion: 'Beto',
    color: '#FFE7BD',
    desc: 'Contagem visual, somas, subtrações, formas geométricas e medidas'
  },
  {
    area: 'music',
    label: 'Música & Ritmo',
    companion: 'Tom',
    color: '#FAD1EF',
    desc: 'Notas musicais com som real, percussão rítmica e instrumentos'
  },
  {
    area: 'languages',
    label: 'Inglês & Idiomas',
    companion: 'Bella',
    color: '#D5E9FF',
    desc: 'Vocabulário ilustrado, saudações e expressões divertidas em inglês'
  }
];

export const FirstTimeOnboarding: React.FC<FirstTimeOnboardingProps> = ({
  onComplete,
  initialPairingCode
}) => {
  const [mode, setMode] = useState<'onboarding' | 'pair_device'>(
    initialPairingCode ? 'pair_device' : 'onboarding'
  );
  const [step, setStep] = useState<number>(1);
  const totalSteps = 9;

  // Step 2: Parent & Family Account
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [familyName, setFamilyName] = useState('');

  // Step 3: First Child Name
  const [childName, setChildName] = useState('');
  const [childNickname, setChildNickname] = useState('');

  // Step 4: Avatar & Companion choice
  const [selectedAvatar, setSelectedAvatar] = useState('Bia');
  const [selectedCompanion, setSelectedCompanion] = useState('Lumi');

  // Step 5: Child Basic Info (Age & Birthdate)
  const [childAge, setChildAge] = useState<number>(6);
  const [birthDate, setBirthDate] = useState<string>('2020-05-15');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('4-6');

  // Step 6: Priority Skills
  const [targetSkills, setTargetSkills] = useState<SkillArea[]>([
    'communication',
    'reasoning',
    'attention'
  ]);

  // Step 7: Daily Routine Config
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(25);
  const [allowedStart, setAllowedStart] = useState('08:00');
  const [allowedEnd, setAllowedEnd] = useState('20:00');

  // Step 8: Parental PIN
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Validation error message
  const [errorMsg, setErrorMsg] = useState('');

  // Pairing Mode State
  const [pairCodeInput, setPairCodeInput] = useState(initialPairingCode || '');
  const [customDeviceName, setCustomDeviceName] = useState(() => storageService.detectDeviceName());
  const [pairingState, setPairingState] = useState<'idle' | 'claiming' | 'waiting_parent' | 'confirmed'>('idle');
  const [pairedChildPreview, setPairedChildPreview] = useState<{ name: string; avatar: string; childId: string } | null>(null);
  const [pairError, setPairError] = useState('');

  const handleAgeSelect = (val: number) => {
    audioService.playGentlePop();
    setChildAge(val);
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

  const validateAndAdvance = async () => {
    setErrorMsg('');

    if (step === 2) {
      if (!parentName.trim() || parentName.trim().length < 2) {
        setErrorMsg('Informe o nome do responsável para criar a conta familiar.');
        return;
      }
      if (!parentEmail.trim() || !parentEmail.includes('@')) {
        setErrorMsg('Informe um e-mail válido para identificar sua conta familiar.');
        return;
      }
      if (!familyName.trim()) {
        setFamilyName(`Família de ${parentName.trim().split(' ')[0]}`);
      }
    }

    if (step === 3) {
      if (!childName.trim() || childName.trim().length < 2) {
        setErrorMsg('Informe o nome da criança para personalizar a experiência.');
        return;
      }
    }

    if (step === 8) {
      if (!/^\d{4,6}$/.test(pin)) {
        setErrorMsg('O PIN parental deve conter de 4 a 6 números.');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMsg('A confirmação do PIN não coincide. Digite novamente.');
        return;
      }
      try {
        confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      audioService.playFanfare();
    } else {
      audioService.playGentlePop();
    }

    setStep(prev => Math.min(totalSteps, prev + 1));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    audioService.playGentlePop();
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleFinishAll = async () => {
    const salt = generateSalt();
    const hashed = await hashPin(pin || '1234', salt);
    const nowIso = new Date().toISOString();
    const familyId = `fam_${Date.now().toString(36)}`;

    const settings: ParentSettings = {
      pinHash: hashed,
      pinSalt: salt,
      isPinSet: true,
      maxDailyMinutes: dailyGoalMinutes,
      allowedTimeRange: { start: allowedStart, end: allowedEnd },
      unlimitedGames: false,
      soundEffectsEnabled: true,
      voiceNarrationEnabled: true,
      notificationsEnabled: true,
      notificationTimes: ['09:00', '16:00'],
      reminderFrequency: 'daily'
    };

    const newFamily: FamilyAccount = {
      id: familyId,
      parentUserId: `usr_${Date.now().toString(36)}`,
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim().toLowerCase(),
      familyName: familyName.trim() || `Família ${parentName.trim()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      settings
    };

    const newProfile: ChildProfile = {
      id: `child_${Date.now().toString(36)}`,
      familyId,
      name: childName.trim(),
      nickname: childNickname.trim() || childName.trim().split(' ')[0],
      age: Number(childAge),
      birthdate: birthDate,
      avatar: selectedAvatar,
      companionId: selectedCompanion,
      ageGroup,
      targetSkills,
      learningPreferences: {
        prioritySkills: targetSkills,
        dailyGoalMinutes,
        soundEnabled: true,
        voiceGuideEnabled: true
      },
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Register this primary device automatically
    storageService.saveDevice({
      id: storageService.getThisDeviceId(),
      childId: newProfile.id,
      familyId,
      deviceName: `${storageService.detectDeviceName()} (Principal)`,
      platform: storageService.detectPlatform(),
      lastActiveAt: nowIso,
      status: 'active',
      createdAt: nowIso
    });

    audioService.playSuccess();
    onComplete(newProfile, newFamily);
  };

  // --- PAIRING FLOW FOR CHILD DEVICE ---
  const handleClaimPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairError('');
    if (!pairCodeInput.trim() || pairCodeInput.trim().length < 6) {
      setPairError('Digite o código de 6 dígitos exibido no painel do responsável.');
      return;
    }

    setPairingState('claiming');
    const res = await storageService.claimPairingCode(pairCodeInput.trim(), customDeviceName);
    if (!res.ok || !res.session) {
      setPairingState('idle');
      setPairError(res.error || 'Código não encontrado ou expirado.');
      return;
    }

    setPairedChildPreview({
      name: res.session.childName || 'Criança',
      avatar: res.session.childAvatar || 'Bia',
      childId: res.session.childId || ''
    });
    setPairingState('waiting_parent');
    audioService.playGentlePop();
  };

  useEffect(() => {
    if (pairingState !== 'waiting_parent' || !pairCodeInput.trim()) return;

    const timer = setInterval(async () => {
      const statusRes = await storageService.checkPairingStatus(pairCodeInput.trim());
      if (statusRes.session?.status === 'confirmed' && statusRes.familyData) {
        clearInterval(timer);
        setPairingState('confirmed');
        storageService.applyPairedFamilyData(statusRes.familyData, statusRes.session.childId);
        audioService.playFanfare();
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [pairingState, pairCodeInput]);

  // --- RENDER DEVICE PAIRING VIEW ---
  if (mode === 'pair_device') {
    return (
      <div className="ak-card-3d max-w-xl w-full mx-auto rounded-[36px] bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-soft p-6 sm:p-10">
        <button
          type="button"
          onClick={() => {
            setMode('onboarding');
            setPairingState('idle');
            setPairError('');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#77758A] dark:text-[#C5BFE6] hover:text-[#7047E8] dark:hover:text-white mb-6"
        >
          <ArrowLeft size={15} />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="ak-sticker-badge w-12 h-12 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] text-[#7047E8] dark:text-[#B5A0FF] flex items-center justify-center shadow-sticker">
            <QrCode size={26} />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7047E8] dark:text-[#B5A0FF]">
              Ecossistema Familiar Multi-Dispositivo
            </span>
            <h1 className="ak-title-display text-2xl font-black text-[#25233A] dark:text-white">
              Conectar Dispositivo Infantil
            </h1>
          </div>
        </div>

        {pairingState === 'idle' || pairingState === 'claiming' ? (
          <form onSubmit={handleClaimPairing} className="space-y-5 mt-4">
            <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6] leading-relaxed">
              No celular ou computador do responsável, abra o <strong>Painel dos Pais → Dispositivos → Conectar Dispositivo</strong> e digite abaixo o código temporário de 6 dígitos:
            </p>

            <div>
              <label className="block text-xs font-black text-[#25233A] dark:text-white mb-2">
                Código de Pareamento (6 dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                value={pairCodeInput}
                onChange={e => setPairCodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 482915"
                className="w-full px-5 py-4 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-center text-2xl font-black tracking-[0.35em] text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#25233A] dark:text-white mb-2">
                Nome deste Aparelho
              </label>
              <input
                type="text"
                value={customDeviceName}
                onChange={e => setCustomDeviceName(e.target.value)}
                placeholder="Ex: iPhone da Sofia / Tablet do Filho"
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-bold text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
              />
            </div>

            {pairError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-[#4C1D24] border border-rose-200 dark:border-[#9F1239] text-xs font-bold text-rose-700 dark:text-[#FDA4AF]">
                {pairError}
              </div>
            )}

            <button
              type="submit"
              disabled={pairingState === 'claiming'}
              className="w-full py-4 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white font-black text-sm shadow-[0_5px_0_#522BBF] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone size={18} />
              <span>{pairingState === 'claiming' ? 'Validando Código...' : 'Vincular ao Perfil Infantil'}</span>
            </button>
          </form>
        ) : pairingState === 'waiting_parent' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF4D6] dark:bg-[#38316B] text-[#8A5A00] dark:text-[#FFD34E] mx-auto flex items-center justify-center animate-pulse">
              <RefreshCw size={30} className="animate-spin" />
            </div>
            <h3 className="ak-title-display text-xl font-black text-[#25233A] dark:text-white">
              Aguardando Confirmação do Responsável
            </h3>
            <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6] max-w-md mx-auto">
              Solicitação enviada para conectar este aparelho ao perfil de{' '}
              <strong className="text-[#25233A] dark:text-white">{pairedChildPreview?.name}</strong>.
              Confirme no painel do responsável para concluir!
            </p>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E9FBF4] dark:bg-[#16382C] text-[#1E7E5B] dark:text-[#6EE7B7] mx-auto flex items-center justify-center">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="ak-title-display text-xl font-black text-[#25233A] dark:text-white">
              Dispositivo Conectado com Sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6]">
              Sincronizando a jornada de {pairedChildPreview?.name}...
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER 9-STEP PREMIUM ONBOARDING ---
  const progressPercent = Math.round((step / totalSteps) * 100);
  const activeCompanionObj =
    MUNDO_COMPANIONS.find(c => c.id === selectedCompanion) || MUNDO_COMPANIONS[0];

  return (
    <div className="max-w-2xl w-full mx-auto my-auto py-4">
      <div className="ak-card-3d rounded-[36px] bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-soft overflow-hidden transition-all duration-300">
        {/* Top Progress Header */}
        <div className="px-6 pt-6 pb-4 bg-[#F5F3FC]/90 dark:bg-[#27234D] border-b border-[#E4DFF5] dark:border-[#38316B]">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#7047E8] text-white text-[11px] font-black shadow-sm">
                Etapa {step} de {totalSteps}
              </span>
              <span className="text-xs font-extrabold text-[#77758A] dark:text-[#C5BFE6]">
                Mundo Ajuda KIDS
              </span>
            </div>
            <span className="text-xs font-black text-[#7047E8] dark:text-[#B5A0FF]">{progressPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-white dark:bg-[#121024] rounded-full overflow-hidden p-0.5 border border-[#E4DFF5] dark:border-[#38316B]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: Apresentação do Ajuda KIDS */}
          {step === 1 && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-[30px] bg-gradient-to-br from-[#F3EFFF] via-white to-[#FFF4D6]/60 dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B]">
                <div className="ak-sticker-badge shrink-0 p-2 rounded-3xl bg-white dark:bg-[#121024]">
                  <WelcomeIllustration size={135} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD34E] text-[#25233A] text-[11px] font-black mb-2 shadow-sm">
                    <Sparkles size={13} /> Bem-vindo ao Mundo Ajuda KIDS
                  </span>
                  <h1 className="ak-title-display text-2xl sm:text-3xl font-black text-[#25233A] dark:text-white leading-tight">
                    Desenvolvimento infantil com afeto, arte e ciência
                  </h1>
                  <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6] mt-2 leading-relaxed font-medium">
                    Uma rotina diária saudável de 20 a 30 minutos com personagens originais, atividades interativas, jogos 3D educativos e acompanhamento familiar sincronizado.
                  </p>
                </div>
              </div>

              {/* Showcase of the Original Guardians */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#77758A] dark:text-[#C5BFE6] block mb-3 text-center">
                  Conheça os Guardiões do Mundo Ajuda KIDS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {MUNDO_COMPANIONS.map(comp => (
                    <div
                      key={comp.id}
                      style={{ backgroundColor: `${comp.bgColor}88` }}
                      className="ak-sticker-badge p-2.5 rounded-2xl border border-[#E4DFF5] dark:border-[#38316B] flex flex-col items-center text-center"
                    >
                      {comp.renderCharacter(52, 'waving')}
                      <span className="text-xs font-black text-[#25233A] dark:text-white mt-1">
                        {comp.name}
                      </span>
                      <span className="text-[9px] font-bold text-[#77758A] dark:text-[#C5BFE6] leading-tight">
                        {comp.skillLabel.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions: Start Family Account OR Connect Child Device */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playGentlePop();
                    setStep(2);
                  }}
                  className="w-full py-4 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white font-black text-base shadow-[0_5px_0_#522BBF] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Criar Conta Familiar</span>
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioService.playGentlePop();
                    setMode('pair_device');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] hover:bg-[#EDE9FE] dark:hover:bg-[#38316B] text-[#25233A] dark:text-white border-2 border-[#E4DFF5] dark:border-[#38316B] font-black text-xs transition-all flex items-center justify-center gap-2"
                >
                  <QrCode size={16} />
                  <span>Este é o celular/tablet da criança? Conectar com Código ou QR Code</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Cadastro da Conta do Responsável */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="ak-sticker-badge w-12 h-12 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] text-[#7047E8] dark:text-[#B5A0FF] flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-[#7047E8] dark:text-[#B5A0FF]">
                    Conta Familiar Centralizada
                  </span>
                  <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                    Dados do Responsável
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6]">
                Sua conta familiar permite gerenciar múltiplos perfis infantis e acompanhar o progresso em tempo real de qualquer dispositivo.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Seu Nome (Mãe, Pai ou Responsável) *
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-bold text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    E-mail Familiar *
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    placeholder="Ex: mariana@familia.com.br"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-bold text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Nome da Família (opcional)
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={e => setFamilyName(e.target.value)}
                    placeholder="Ex: Família Silva"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-bold text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Criação do Primeiro Perfil Infantil */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFF4D6]/60 dark:bg-[#27234D] border-2 border-[#FFD34E]/60 dark:border-[#38316B]">
                <div>
                  <span className="text-[11px] font-black uppercase text-[#8A5A00] dark:text-[#FFD34E]">
                    Primeiro Explorador
                  </span>
                  <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                    Quem vai aprender e brincar?
                  </h2>
                  <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] mt-0.5">
                    Você poderá adicionar mais irmãos depois no painel familiar.
                  </p>
                </div>
                <div className="ak-sticker-badge shrink-0 p-1.5 rounded-2xl bg-white dark:bg-[#121024]">
                  {MUNDO_COMPANIONS[0].renderCharacter(68, 'happy')}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Nome da Criança *
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="Ex: Sofia"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-base font-black text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Apelido Carinhoso (como o app vai saudar a criança)
                  </label>
                  <input
                    type="text"
                    value={childNickname}
                    onChange={e => setChildNickname(e.target.value)}
                    placeholder="Ex: Sofi"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-bold text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Escolha de Avatar e Guardião */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-black uppercase text-[#7047E8] dark:text-[#B5A0FF]">
                  Identidade Visual Infantil
                </span>
                <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                  Escolha o Avatar e o Guardião de {childName || 'sua criança'}
                </h2>
              </div>

              <div>
                <label className="block text-xs font-black text-[#25233A] dark:text-white mb-2.5">
                  1. Avatar de {childName}:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {KID_CHARACTERS.map(char => {
                    const isSelected = selectedAvatar === char.name;
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => {
                          audioService.playGentlePop();
                          setSelectedAvatar(char.name);
                          setSelectedCompanion(char.companionId);
                        }}
                        className={`p-3 rounded-2xl border-2 flex flex-col items-center transition-all ${
                          isSelected
                            ? 'border-[#7047E8] bg-[#F3EFFF] dark:bg-[#27234D] shadow-sticker scale-105'
                            : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC] dark:bg-[#121024] opacity-85 hover:opacity-100'
                        }`}
                      >
                        {char.renderAvatar(48)}
                        <span className="text-xs font-black text-[#25233A] dark:text-white mt-1.5">
                          {char.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#25233A] dark:text-white mb-2.5">
                  2. Guardião Companheiro no Mundo Ajuda KIDS:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {MUNDO_COMPANIONS.map(comp => {
                    const isSelected = selectedCompanion === comp.id;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          audioService.playGentlePop();
                          setSelectedCompanion(comp.id);
                        }}
                        className={`p-3 rounded-2xl border-2 flex sm:flex-col items-center gap-3 sm:gap-1 text-left sm:text-center transition-all ${
                          isSelected
                            ? 'border-[#7047E8] bg-white dark:bg-[#27234D] shadow-sticker scale-102'
                            : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC]/80 dark:bg-[#121024] opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="shrink-0">{comp.renderCharacter(48, 'happy')}</div>
                        <div>
                          <span className="text-xs font-black text-[#25233A] dark:text-white block">
                            {comp.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#77758A] dark:text-[#C5BFE6] block">
                            {comp.title.replace('Guardião da ', '').replace('Guardiã da ', '')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Informações Básicas e Faixa Etária */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-black uppercase text-[#7047E8] dark:text-[#B5A0FF]">
                  Adaptação Pedagógica
                </span>
                <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                  Idade e Fase de Desenvolvimento
                </h2>
                <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] mt-1">
                  As atividades e jogos 3D são calibrados automaticamente para a idade de {childName}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-[#25233A] dark:text-white mb-2">
                  Selecione a Idade Atual ({childAge} anos):
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleAgeSelect(yr)}
                      className={`py-3 rounded-2xl font-black text-sm border-2 transition-all ${
                        childAge === yr
                          ? 'bg-[#7047E8] text-white border-[#522BBF] shadow-[0_3px_0_#522BBF] scale-105'
                          : 'bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-white border-[#DDD6F3] dark:border-[#38316B]'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Data de Nascimento (opcional)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-bold text-[#25233A] dark:text-white"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#E9FBF4] dark:bg-[#16382C] border-2 border-[#36C995]/50 dark:border-[#36C995]/40 flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase text-[#1E7E5B] dark:text-[#6EE7B7]">
                    Trilha Selecionada Automaticamente
                  </span>
                  <span className="text-base font-black text-[#25233A] dark:text-white mt-0.5">
                    Faixa de {ageGroup} anos
                  </span>
                  <span className="text-[11px] font-medium text-[#77758A] dark:text-[#D8D2F8]">
                    {ageGroup === '4-6'
                      ? 'Foco lúdico em sons, cores, rimas e coordenação.'
                      : ageGroup === '7-9'
                      ? 'Foco em leitura, desafios lógicos, atenção e cooperação.'
                      : 'Foco em raciocínio estruturado, autonomia e expressão.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Seleção das Habilidades Prioritárias */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-black uppercase text-[#7047E8] dark:text-[#B5A0FF]">
                  Currículo Personalizado
                </span>
                <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                  Quais habilidades deseja priorizar para {childName}?
                </h2>
                <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] mt-0.5">
                  Selecione pelo menos 1 área prioritária para compor as jornadas diárias:
                </p>
              </div>

              <div className="space-y-2.5">
                {SKILL_ITEMS.map(item => {
                  const isSelected = targetSkills.includes(item.area);
                  return (
                    <button
                      key={item.area}
                      type="button"
                      onClick={() => toggleSkill(item.area)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[#7047E8] bg-white dark:bg-[#27234D] shadow-sticker'
                          : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC]/80 dark:bg-[#121024] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          style={{ backgroundColor: item.color }}
                          className="ak-sticker-badge w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs text-[#25233A] border border-white"
                        >
                          {item.companion}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-[#25233A] dark:text-white">
                            {item.label}
                          </h4>
                          <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#7047E8] text-white' : 'border-2 border-[#DDD6F3] dark:border-[#38316B]'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Configuração Inicial da Rotina */}
          {step === 7 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="ak-sticker-badge w-12 h-12 rounded-2xl bg-[#E9FBF4] dark:bg-[#16382C] text-[#1E7E5B] dark:text-[#6EE7B7] flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-[#36C995] dark:text-[#6EE7B7]">
                    Bem-Estar Digital
                  </span>
                  <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                    Configuração da Rotina Saudável
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6]">
                Defina o tempo diário ideal para estimular o desenvolvimento sem gerar uso excessivo de telas:
              </p>

              <div>
                <label className="block text-xs font-black text-[#25233A] dark:text-white mb-2">
                  Meta de Tempo Diário:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { min: 15, label: '15 min/dia', tag: 'Rotina Curta' },
                    { min: 25, label: '25 min/dia', tag: 'Recomendado' },
                    { min: 30, label: '30 min/dia', tag: 'Rotina Completa' }
                  ].map(opt => (
                    <button
                      key={opt.min}
                      type="button"
                      onClick={() => {
                        audioService.playGentlePop();
                        setDailyGoalMinutes(opt.min);
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        dailyGoalMinutes === opt.min
                          ? 'border-[#36C995] bg-[#E9FBF4] dark:bg-[#16382C] shadow-sticker'
                          : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC] dark:bg-[#121024]'
                      }`}
                    >
                      <span className="text-base font-black text-[#25233A] dark:text-white block">{opt.label}</span>
                      <span className="text-[10px] font-bold text-[#77758A] dark:text-[#C5BFE6]">{opt.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Horário Inicial Permitido
                  </label>
                  <input
                    type="time"
                    value={allowedStart}
                    onChange={e => setAllowedStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-black text-[#25233A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Horário Final (Proteção do Sono)
                  </label>
                  <input
                    type="time"
                    value={allowedEnd}
                    onChange={e => setAllowedEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-sm font-black text-[#25233A] dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Definição do PIN Parental */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="ak-sticker-badge w-12 h-12 rounded-2xl bg-[#7047E8] text-[#FFD34E] flex items-center justify-center shrink-0 shadow-sticker">
                  <Lock size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-[#7047E8] dark:text-[#B5A0FF]">
                    Segurança Criptografada
                  </span>
                  <h2 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
                    Defina o PIN Parental
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6]">
                Este PIN de 4 a 6 dígitos protege o Painel dos Responsáveis, o pareamento de novos aparelhos e as configurações de tempo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Novo PIN (4 a 6 números) *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-center text-xl font-black tracking-[0.35em] text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#25233A] dark:text-white mb-1.5">
                    Confirmar PIN *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-center text-xl font-black tracking-[0.35em] text-[#25233A] dark:text-white focus:outline-none focus:border-[#7047E8]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] text-xs font-semibold text-[#25233A] dark:text-[#D8D2F8] flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0 text-[#7047E8] dark:text-[#B5A0FF]" />
                <span>O PIN nunca é salvo em texto puro — utilizamos hash SHA-256 com salt exclusivo.</span>
              </div>
            </div>
          )}

          {/* STEP 9: Tela de Conclusão Celebrativa */}
          {step === 9 && (
            <div className="text-center space-y-6 py-2">
              <div className="flex justify-center">
                <div className="ak-sticker-badge p-3 rounded-3xl bg-[#F5F3FC] dark:bg-[#27234D]">
                  {activeCompanionObj.renderCharacter(115, 'celebrating')}
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E9FBF4] dark:bg-[#16382C] text-[#1E7E5B] dark:text-[#6EE7B7] text-xs font-black mb-2">
                  <CheckCircle2 size={14} /> Tudo Pronto!
                </span>
                <h2 className="ak-title-display text-2xl sm:text-3xl font-black text-[#25233A] dark:text-white">
                  O Mundo de {childName} está preparado!
                </h2>
                <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6] max-w-md mx-auto mt-1.5">
                  A conta da <strong>{familyName || `Família de ${parentName}`}</strong> foi configurada com sucesso. Você pode conectar outros celulares ou tablets a qualquer momento no Painel Familiar.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#E4DFF5] dark:border-[#38316B] max-w-md mx-auto grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-[#77758A] dark:text-[#C5BFE6] block">Criança</span>
                  <span className="text-xs font-black text-[#25233A] dark:text-white">{childName} ({childAge}a)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#77758A] dark:text-[#C5BFE6] block">Guardião</span>
                  <span className="text-xs font-black text-[#25233A] dark:text-white">{activeCompanionObj.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#77758A] dark:text-[#C5BFE6] block">Rotina</span>
                  <span className="text-xs font-black text-[#25233A] dark:text-white">{dailyGoalMinutes} min/dia</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishAll}
                className="w-full py-4 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white font-black text-base shadow-[0_5px_0_#522BBF] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={18} className="text-[#FFD34E]" />
                <span>Entrar no Mundo Ajuda KIDS</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-[#4C1D24] border border-rose-200 dark:border-[#9F1239] text-xs font-bold text-rose-700 dark:text-[#FDA4AF] animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {/* Navigation Footer for Steps 2..8 */}
          {step >= 2 && step <= 8 && (
            <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-[#E4DFF5] dark:border-[#38316B]">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B] text-xs font-black text-[#25233A] dark:text-white hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] flex items-center gap-1.5"
              >
                <ArrowLeft size={15} />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={validateAndAdvance}
                className="px-7 py-3.5 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white text-xs font-black shadow-[0_4px_0_#522BBF] active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>{step === 8 ? 'Concluir Configuração' : 'Continuar'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
