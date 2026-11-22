import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  User,
  UserCheck,
  ArrowRight,
  KeyRound,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  QrCode,
  Loader2,
  Clock,
  RotateCw,
  Edit3,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { useApp } from '@/modules/context/AppContext';
import { MUNDO_COMPANIONS } from '@/data/charactersData';
import { StarSymbolSvg, CloudSymbolSvg } from '@/components/illustrations/CustomIcons';
import { AmbientAdultBackdrop } from '@/components/illustrations/ThematicPageBackgrounds';
import { EliteInput } from '@/design-system/EliteForms';
import { Button } from '@/components/common/Button';
import { AjudaKidsMascot, AjudaKidsBrandBadge } from '@/components/common/AjudaKidsMascot';
import { storageService } from '@/services/storageService';
import {
  evaluatePasswordRequirements,
  getPasswordRequirementErrorMessage,
  type PasswordRequirementsStatus
} from '@/services/authService';

const PasswordRequirementsChecklist: React.FC<{
  status: PasswordRequirementsStatus;
  hasTyped: boolean;
  testId?: string;
}> = ({ status, hasTyped, testId = 'password-requirements-checklist' }) => {
  const items = [
    { key: 'minLength', label: 'Mínimo de 8 caracteres', met: status.minLength },
    { key: 'hasUppercase', label: 'Pelo menos 1 letra maiúscula (A–Z)', met: status.hasUppercase },
    { key: 'hasNumber', label: 'Pelo menos 1 número (0–9)', met: status.hasNumber },
    {
      key: 'hasSpecial',
      label: 'Pelo menos 1 caractere especial (ex.: !@#$%&*)',
      met: status.hasSpecial
    }
  ];
  const metCount = items.filter(i => i.met).length;

  return (
    <div
      data-testid={testId}
      className="rounded-2xl p-3 bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] space-y-2 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#77758A] dark:text-[#C5BFE6]">
          Requisitos da senha
        </span>
        <span
          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full tabular-nums ${
            status.isValid
              ? 'bg-[#E9FBF4] dark:bg-[#16382C] text-[#1E7E5B] dark:text-[#4ADE80]'
              : 'bg-[#EDE9FE] dark:bg-[#27234D] text-[#7047E8] dark:text-[#C5BFE6]'
          }`}
        >
          {metCount}/4 atendidos
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map(item => (
          <li
            key={item.key}
            data-met={item.met ? 'true' : 'false'}
            className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
              item.met
                ? 'text-[#1E6917] dark:text-[#4ADE80]'
                : hasTyped
                ? 'text-[#9F1239] dark:text-[#FDA4AF]'
                : 'text-[#4B5E82] dark:text-[#CBD5E1]'
            }`}
          >
            {item.met ? (
              <CheckCircle2 size={14} className="shrink-0 text-[#2FA10D] dark:text-[#4ADE80]" />
            ) : (
              <Circle size={13} className="shrink-0 opacity-75" />
            )}
            <span className="leading-snug">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

type AuthTab = 'login' | 'register' | 'recover' | 'pair';

interface ParentAuthViewProps {
  initialPairingCode?: string | null;
  onPairingComplete?: () => void;
  onOpenAbout?: () => void;
}

export const ParentAuthView: React.FC<ParentAuthViewProps> = ({
  initialPairingCode,
  onPairingComplete,
  onOpenAbout
}) => {
  const {
    requestRegistrationVerification,
    confirmRegistrationVerification,
    loginParent,
    requestPasswordReset,
    confirmPasswordReset,
    reloadAllFromStorage,
    setPairedChildDevice,
    isDarkMode,
    toggleDarkMode
  } = useApp();

  const [mode, setMode] = useState<AuthTab>(initialPairingCode ? 'pair' : 'login');

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields & 6-digit e-mail verification state
  const [registerStep, setRegisterStep] = useState<'form' | 'verify'>('form');
  const [parentName, setParentName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentPin, setParentPin] = useState('1234');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [regExpiresAt, setRegExpiresAt] = useState<number | null>(null);
  const [regSecondsLeft, setRegSecondsLeft] = useState<number>(600);
  const [regResendCooldown, setRegResendCooldown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Recover password fields (3-step verified flow)
  const [recoverStep, setRecoverStep] = useState<1 | 2 | 3>(1);
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoverCode, setRecoverCode] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverConfirmPassword, setRecoverConfirmPassword] = useState('');

  // Child pairing fields
  const [pairCode, setPairCode] = useState(initialPairingCode || '');
  const [pairDeviceName, setPairDeviceName] = useState('');
  const [pairStatusMsg, setPairStatusMsg] = useState<string | null>(null);
  const [waitingConfirmCode, setWaitingConfirmCode] = useState<string | null>(null);

  // Shared UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unverifiedLoginEmail, setUnverifiedLoginEmail] = useState<string | null>(null);
  const [duplicateEmailAlert, setDuplicateEmailAlert] = useState<string | null>(null);

  useEffect(() => {
    if (initialPairingCode) {
      setMode('pair');
      setPairCode(initialPairingCode);
    }
  }, [initialPairingCode]);

  // Real-time password requirements for register and password recovery
  const regPasswordReqs = React.useMemo(
    () => evaluatePasswordRequirements(regPassword),
    [regPassword]
  );
  const recoverPasswordReqs = React.useMemo(
    () => evaluatePasswordRequirements(recoverNewPassword),
    [recoverNewPassword]
  );

  // Poll pairing approval when child claims code
  useEffect(() => {
    if (!waitingConfirmCode) return;
    const timer = setInterval(async () => {
      const status = await storageService.checkPairingStatus(waitingConfirmCode);
      if (status.session?.status === 'confirmed' && status.familyData) {
        clearInterval(timer);
        storageService.clearAllData();
        storageService.applyRemoteFamilyState(status.familyData, true);
        if (status.session.childId) {
          storageService.setActiveChildId(status.session.childId);
        }
        setPairedChildDevice(true);
        await reloadAllFromStorage();
        setWaitingConfirmCode(null);
        setSuccessMsg('Dispositivo conectado à família com sucesso!');
        if (onPairingComplete) onPairingComplete();
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [waitingConfirmCode, reloadAllFromStorage, setPairedChildDevice, onPairingComplete]);

  // Live OTP countdown + resend cooldown timers for 6-digit email verification
  useEffect(() => {
    if (mode !== 'register' || registerStep !== 'verify' || !regExpiresAt) return;
    const updateTick = () => {
      const remaining = Math.max(0, Math.ceil((regExpiresAt - Date.now()) / 1000));
      setRegSecondsLeft(remaining);
      setRegResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    };
    updateTick();
    const interval = setInterval(updateTick, 1000);
    return () => clearInterval(interval);
  }, [mode, registerStep, regExpiresAt]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const switchMode = (nextMode: AuthTab) => {
    setMode(nextMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnverifiedLoginEmail(null);
    setDuplicateEmailAlert(null);
    if (nextMode === 'recover') {
      setRecoverStep(1);
      setRecoverCode('');
      setRecoverNewPassword('');
      setRecoverConfirmPassword('');
    }
    if (nextMode !== 'register') {
      setRegisterStep('form');
      setOtpDigits(['', '', '', '', '', '']);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnverifiedLoginEmail(null);
    setDuplicateEmailAlert(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg('Digite seu e-mail ou nome de usuário.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Digite sua senha para entrar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginParent({
        identifier: loginIdentifier.trim(),
        password: loginPassword
      });
      if (!res.success) {
        if (res.code === 'EMAIL_NOT_VERIFIED' && res.email) {
          setEmail(res.email);
          setUnverifiedLoginEmail(res.email);
        }
        setErrorMsg(res.error || 'Não foi possível entrar.');
      } else {
        setSuccessMsg('Login realizado! Abrindo o Hub da Família...');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDuplicateEmailAlert(null);

    if (parentName.trim().length < 2) {
      setErrorMsg('Digite o nome completo do responsável.');
      return;
    }
    if (username.trim().length < 3 || !/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      setErrorMsg('Nome de usuário inválido (use ao menos 3 caracteres, letras ou números).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Digite um e-mail válido.');
      return;
    }
    const regPwdErr = getPasswordRequirementErrorMessage(regPassword);
    if (regPwdErr) {
      setErrorMsg(regPwdErr);
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMsg('A confirmação de senha não confere.');
      return;
    }
    if (!/^\d{4}$/.test(parentPin)) {
      setErrorMsg('O PIN dos pais deve ter 4 números.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestRegistrationVerification({
        parentName: parentName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: regPassword,
        pin: parentPin
      });
      if (!res.success) {
        if (res.code === 'DUPLICATE_EMAIL') {
          setDuplicateEmailAlert(email.trim());
        }
        setErrorMsg(res.error || 'Não foi possível iniciar a verificação do e-mail.');
        return;
      }

      const expAt = res.expiresAt || Date.now() + 10 * 60 * 1000;
      setRegExpiresAt(expAt);
      setRegSecondsLeft(Math.max(1, Math.ceil((expAt - Date.now()) / 1000)));
      setRegResendCooldown(res.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setRegisterStep('verify');
      setSuccessMsg(
        res.message ||
          `Enviamos um código numérico de 6 dígitos para ${email.trim()}. Confirme abaixo para concluir o cadastro.`
      );
      setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpDigitChange = (index: number, rawValue: string) => {
    const cleanDigits = rawValue.replace(/\D/g, '');
    if (!cleanDigits) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    if (cleanDigits.length > 1) {
      const chars = cleanDigits.slice(0, 6).split('');
      setOtpDigits((prev) => {
        const next = [...prev];
        chars.forEach((ch, offset) => {
          if (index + offset < 6) {
            next[index + offset] = ch;
          }
        });
        return next;
      });
      const focusIdx = Math.min(5, index + chars.length);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = cleanDigits;
      return next;
    });
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, idx) => {
      next[idx] = ch;
    });
    setOtpDigits(next);
    otpInputRefs.current[Math.min(5, pasted.length - 1)]?.focus();
  };

  const handleConfirmVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDuplicateEmailAlert(null);

    const code = otpDigits.join('');
    if (!/^\d{6}$/.test(code)) {
      setErrorMsg('Informe todos os 6 dígitos do código enviado para o seu e-mail.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await confirmRegistrationVerification(email.trim(), code);
      if (!res.success) {
        if (res.code === 'DUPLICATE_EMAIL') {
          setDuplicateEmailAlert(email.trim());
        }
        setErrorMsg(res.error || 'Código de verificação inválido.');
        return;
      }
      setSuccessMsg('E-mail verificado! Conta familiar criada com sucesso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (regResendCooldown > 0 || isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const res = await requestRegistrationVerification({
        parentName: parentName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: regPassword,
        pin: parentPin
      });
      if (!res.success) {
        if (res.retryAfterSeconds) {
          setRegResendCooldown(res.retryAfterSeconds);
        }
        setErrorMsg(res.error || 'Não foi possível reenviar o código agora.');
        return;
      }
      const expAt = res.expiresAt || Date.now() + 10 * 60 * 1000;
      setRegExpiresAt(expAt);
      setRegSecondsLeft(Math.max(1, Math.ceil((expAt - Date.now()) / 1000)));
      setRegResendCooldown(res.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`Novo código de 6 dígitos enviado para ${email.trim()}!`);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoverIdentifier.trim()) {
      setErrorMsg('Informe o e-mail ou nome de usuário da conta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(recoverIdentifier.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Não foi possível solicitar o código de recuperação.');
        return;
      }
      setSuccessMsg(
        res.message ||
          'Enviamos um código de verificação de 6 dígitos para o seu e-mail. Confira a caixa de entrada e também a pasta de Spam do Gmail.'
      );
      setRecoverStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoverCode.trim()) {
      setErrorMsg('Digite o código de verificação de 6 dígitos.');
      return;
    }
    const recoverPwdErr = getPasswordRequirementErrorMessage(recoverNewPassword);
    if (recoverPwdErr) {
      setErrorMsg(recoverPwdErr);
      return;
    }
    if (recoverNewPassword !== recoverConfirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await confirmPasswordReset({
        identifier: recoverIdentifier.trim(),
        code: recoverCode.trim(),
        newPassword: recoverNewPassword
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Não foi possível validar o código ou alterar a senha.');
        return;
      }
      setLoginIdentifier(recoverIdentifier.trim());
      setLoginPassword('');
      setSuccessMsg(
        res.message || 'Senha alterada com sucesso! Agora você já pode entrar com sua nova senha.'
      );
      setRecoverStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPairStatusMsg(null);
    const clean = pairCode.replace(/\D/g, '');
    if (clean.length !== 6) {
      setErrorMsg('Digite o código numérico de 6 dígitos gerado no painel dos pais.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await storageService.claimPairingCode(
        clean,
        pairDeviceName.trim() || undefined
      );
      if (!res.ok) {
        setErrorMsg(res.error || 'Código inválido ou expirado.');
      } else {
        setWaitingConfirmCode(clean);
        setPairStatusMsg(
          `Código validado para ${res.session?.childName || 'sua criança'}! Peça ao responsável para clicar em "Aprovar Dispositivo" no painel dos pais.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8F7FF] flex flex-col justify-between p-4 sm:p-8 overflow-hidden transition-colors duration-200">
      <AmbientAdultBackdrop />

      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3 z-10">
        <AjudaKidsBrandBadge size={44} subtitle="ESPAÇO SEGURO PARA FAMÍLIAS" />

        <div className="flex items-center gap-2">
          {onOpenAbout && (
            <button
              type="button"
              data-testid="auth-about-button"
              onClick={onOpenAbout}
              aria-label="Sobre o Ajuda KIDS"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF] shadow-xs hover:bg-[#EFEAFC] dark:hover:bg-[#27234D] transition-all"
            >
              <Info size={15} className="text-[#7047E8] dark:text-[#B5A0FF]" />
              <span>Sobre</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleDarkMode}
            aria-pressed={isDarkMode}
            aria-label={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF] shadow-xs hover:bg-[#EFEAFC] dark:hover:bg-[#27234D] transition-all"
          >
            {isDarkMode ? (
              <>
                <Sun size={15} className="text-[#FFD34E]" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-[#7047E8]" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Illustrated Storytelling Column (Desktop & Tablet) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-[#FFF8DF] dark:bg-[#27234D] text-[#8F6500] dark:text-[#FFD34E] px-4 py-1.5 rounded-full border border-[#F5D66B] dark:border-[#493D86] text-xs font-extrabold shadow-xs">
            <ShieldCheck size={15} />
            <span>Ambiente Familiar Protegido e Livre de Anúncios</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight text-[#25233A] dark:text-[#F8F7FF]">
            Aprender brincando, com{' '}
            <span className="text-[#7047E8] dark:text-[#FF9B42] underline decoration-[#36C995] decoration-4 underline-offset-4">
              acompanhamento dos pais
            </span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-[#77758A] dark:text-[#B8B3D6] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Crie sua conta familiar para organizar perfis infantis, acompanhar a evolução pedagógica em gráficos reais e liberar jogos 3D educativos.
          </p>

          {/* Illustrated Band featuring Exclusive AjudaKIDS 3D Mascot & Companions */}
          <div className="relative bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md rounded-[26px] border border-[#E4DFF5] dark:border-[#38316B] p-5 sm:p-6 shadow-edtech overflow-hidden">
            <div className="absolute -top-3 right-6 opacity-85 pointer-events-none animate-floatSlow">
              <CloudSymbolSvg className="w-12 h-12" />
            </div>
            <div className="absolute top-3 left-6 opacity-90 pointer-events-none">
              <StarSymbolSvg className="w-8 h-8" />
            </div>

            <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-5 pt-3">
              <div className="flex flex-col items-center group">
                <div className="p-1.5 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#D8CCFA] dark:border-[#7047E8] shadow-sm transition-transform group-hover:scale-110">
                  <AjudaKidsMascot size={86} pose="waving" />
                </div>
                <span className="mt-1.5 text-[11px] font-black text-white bg-[#7047E8] px-3 py-0.5 rounded-full shadow-xs">
                  Kiko (Guia)
                </span>
              </div>
              {MUNDO_COMPANIONS.slice(0, 3).map((comp, idx) => (
                <div
                  key={comp.id}
                  className="flex flex-col items-center group"
                  style={{ transform: idx % 2 === 0 ? 'translateY(-4px)' : 'translateY(2px)' }}
                >
                  <div className="p-1.5 rounded-full bg-white dark:bg-[#171430] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm transition-transform group-hover:scale-110">
                    {comp.renderCharacter(80, idx === 0 ? 'waving' : 'happy')}
                  </div>
                  <span
                    style={{
                      backgroundColor: isDarkMode ? '#27234D' : comp.bgColor,
                      borderColor: isDarkMode ? `${comp.accentColor}99` : undefined
                    }}
                    className="mt-1.5 text-[11px] font-black text-[#25233A] dark:text-[#F8F7FF] px-3 py-0.5 rounded-full border border-[#25233A]/15 shadow-xs transition-colors"
                  >
                    {comp.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4DFF5] dark:border-[#38316B] flex flex-wrap justify-center lg:justify-between gap-2 text-[11px] font-extrabold text-[#4A4668] dark:text-[#B8B3D6]">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-[#36C995]" />
                Jornadas de 20 a 30 min/dia
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-[#36C995]" />
                Jogos 3D educativos
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-[#36C995]" />
                Sincronia multi-dispositivo
              </span>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-[#1E1B3A] rounded-[26px] border border-[#E4DFF5] dark:border-[#38316B] shadow-[0_18px_45px_rgba(37,35,58,0.09)] dark:shadow-[0_18px_45px_rgba(8,6,20,0.58)] p-6 sm:p-8 space-y-5 transition-colors">
            {/* Mode Switcher Pills */}
            <div
              role="tablist"
              aria-label="Acesso à conta familiar"
              className="grid grid-cols-2 gap-2 p-1.5 bg-[#F5F3FC] dark:bg-[#171430] rounded-2xl border border-[#E4DFF5] dark:border-[#38316B]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={`py-2.5 rounded-xl font-display font-extrabold text-sm transition-all ${
                  mode === 'login'
                    ? 'bg-[#7047E8] text-white shadow-sm'
                    : 'text-[#77758A] dark:text-[#B8B3D6] hover:text-[#25233A] dark:hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => switchMode('register')}
                className={`py-2.5 rounded-xl font-display font-extrabold text-sm transition-all ${
                  mode === 'register'
                    ? 'bg-[#4389F5] dark:bg-[#FF9B42] text-white dark:text-[#121024] shadow-sm'
                    : 'text-[#77758A] dark:text-[#B8B3D6] hover:text-[#25233A] dark:hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div
                role="alert"
                className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FFF1F2] dark:bg-[#4C1D24] border border-[#FECDD3] dark:border-[#9F1239] text-[#9F1239] dark:text-[#FECDD3] text-xs font-bold animate-shake"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={17} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {unverifiedLoginEmail && mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetEmail = unverifiedLoginEmail;
                      switchMode('register');
                      setEmail(targetEmail);
                      setRegisterStep('form');
                    }}
                    className="self-start ml-6 text-xs font-extrabold underline text-[#5843F4] dark:text-[#FF9900]"
                  >
                    Confirmar e-mail ({unverifiedLoginEmail}) no cadastro →
                  </button>
                )}
                {duplicateEmailAlert && mode === 'register' && (
                  <div className="flex flex-wrap gap-3 ml-6 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const targetEmail = duplicateEmailAlert;
                        switchMode('login');
                        setLoginIdentifier(targetEmail);
                      }}
                      className="text-xs font-extrabold underline text-[#5843F4] dark:text-[#FF9900]"
                    >
                      Entrar com este e-mail →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetEmail = duplicateEmailAlert;
                        switchMode('recover');
                        setRecoverIdentifier(targetEmail);
                      }}
                      className="text-xs font-extrabold underline text-[#9F1239] dark:text-[#FECDD3]"
                    >
                      Esqueci minha senha →
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#DCF5D2] dark:bg-[#133A27] border border-[#8ED97A] dark:border-[#25D366]/60 text-[#1E6917] dark:text-[#A7F3D0] text-xs font-bold animate-fadeIn"
              >
                <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* MODE: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="ak-title-display font-executive text-2xl font-extrabold text-[#25233A] dark:text-white">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6] mt-0.5">
                    Acesse a conta da família com seu e-mail ou nome de usuário.
                  </p>
                </div>

                <EliteInput
                  label="E-mail ou nome de usuário"
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="ex: maria@email.com ou maria.silva"
                  autoComplete="username"
                  leftIcon={<Mail size={16} />}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-0.5">
                    <label className="text-xs font-extrabold text-[#25233A] dark:text-[#E2E8F0]">Senha</label>
                    <button
                      type="button"
                      onClick={() => switchMode('recover')}
                      className="text-xs font-extrabold text-[#7047E8] dark:text-[#B5A0FF] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <EliteInput
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    leftIcon={<Lock size={16} />}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight size={17} />}
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar na Conta Familiar'}
                </Button>
              </form>
            )}

            {/* MODE: REGISTER (STEP 1 FORM / STEP 2 VERIFY 6-DIGIT EMAIL CODE) */}
            {mode === 'register' && registerStep === 'form' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fadeIn">
                <div>
                  <h2 className="ak-title-display font-executive text-2xl font-extrabold text-[#25233A] dark:text-white">
                    Criar Conta do Responsável
                  </h2>
                  <p className="text-xs font-semibold text-[#5A6D91] dark:text-[#94A3B8] mt-0.5">
                    Validamos seu e-mail com um código de 6 dígitos para proteger os dados da família.
                  </p>
                </div>

                <EliteInput
                  label="Nome completo do responsável"
                  size="sm"
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="Ex: Maria Oliveira"
                  autoComplete="name"
                  leftIcon={<User size={15} />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <EliteInput
                    label="Nome de usuário"
                    size="sm"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="ex: maria.kids"
                    autoComplete="username"
                    leftIcon={<UserCheck size={15} />}
                  />
                  <EliteInput
                    label="PIN Parental (4 dígitos)"
                    size="sm"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={parentPin}
                    onChange={e => setParentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    leftIcon={<ShieldCheck size={15} />}
                    className="tracking-widest font-mono"
                  />
                </div>

                <EliteInput
                  label="E-mail (receberá o código de confirmação)"
                  size="sm"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  leftIcon={<Mail size={15} />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <EliteInput
                    label="Senha forte (8+ caract.)"
                    size="sm"
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Ex: Ajuda@2026"
                    autoComplete="new-password"
                    leftIcon={<Lock size={15} />}
                  />
                  <EliteInput
                    label="Confirmar senha"
                    size="sm"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    leftIcon={<Lock size={15} />}
                  />
                </div>

                <PasswordRequirementsChecklist
                  status={regPasswordReqs}
                  hasTyped={regPassword.length > 0}
                  testId="password-requirements-checklist"
                />

                <Button
                  type="submit"
                  variant="confirm"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight size={17} />}
                >
                  {isSubmitting ? 'Enviando código...' : 'Continuar e Verificar E-mail'}
                </Button>
              </form>
            )}

            {mode === 'register' && registerStep === 'verify' && (
              <form onSubmit={handleConfirmVerificationSubmit} className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#261F4C] border border-[#D5E4F0] dark:border-[#3F3378]">
                  <div className="w-12 h-12 rounded-2xl bg-[#1ED2F7]/20 dark:bg-[#5843F4]/30 border border-[#1ED2F7]/40 flex items-center justify-center shrink-0">
                    {MUNDO_COMPANIONS[0].renderCharacter(42, 'happy')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="ak-title-display font-executive text-lg font-extrabold text-[#25233A] dark:text-white leading-tight">
                      Confirme seu E-mail
                    </h2>
                    <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6] truncate mt-0.5">
                      Código de 6 dígitos para <strong className="text-[#25233A] dark:text-white">{email.trim()}</strong>
                    </p>
                  </div>
                </div>

                {/* Confirmação de envio para o e-mail informado e aviso da caixa de Spam do Gmail */}
                <div
                  data-testid="resend-delivery-banner"
                  className="p-3.5 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] text-xs text-[#25233A] dark:text-[#F8FAFC] space-y-1"
                >
                  <div className="font-extrabold flex items-center gap-1.5 text-[#7047E8] dark:text-[#B5A0FF]">
                    <Mail size={15} />
                    <span>Código enviado para o seu e-mail</span>
                  </div>
                  <p className="font-semibold text-[#77758A] dark:text-[#D8D2F8] leading-relaxed">
                    Enviamos um código de 6 dígitos para <strong>{email.trim()}</strong>. O código tem validade de 10 minutos e pode ser utilizado apenas uma vez.
                  </p>
                </div>

                <div
                  data-testid="gmail-spam-warning-banner"
                  className="p-3.5 rounded-2xl bg-[#FFF4D6] dark:bg-[#27234D] border border-[#FFD34E]/60 dark:border-[#FFD34E]/50 text-xs text-[#25233A] dark:text-[#F8FAFC] space-y-1"
                >
                  <div className="font-extrabold flex items-center gap-1.5 text-[#8A5A00] dark:text-[#FFD34E]">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>Não encontrou o e-mail? Verifique a Caixa de Spam!</span>
                  </div>
                  <p className="font-semibold text-[#77758A] dark:text-[#D8D2F8] leading-relaxed">
                    Às vezes a mensagem com o código pode cair na caixa de <strong>Spam (Lixo Eletrônico)</strong> ou nas abas <strong>Promoções/Atualizações</strong> do Gmail sem você perceber. Confira lá caso não apareça na caixa de entrada principal.
                  </p>
                </div>

                {/* 6 Individual OTP Digit Inputs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <label className="text-xs font-extrabold text-[#25233A] dark:text-[#E2E8F0]">
                      Digite os 6 dígitos
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold tabular-nums px-2.5 py-0.5 rounded-full border ${
                        regSecondsLeft <= 0
                          ? 'bg-[#FFF1F2] dark:bg-[#4C1D24] border-[#FECDD3] dark:border-[#9F1239] text-[#9F1239] dark:text-[#FECDD3]'
                          : 'bg-[#F3EFFF] dark:bg-[#121024] border-[#DDD6F3] dark:border-[#38316B] text-[#7047E8] dark:text-[#B5A0FF]'
                      }`}
                    >
                      <Clock size={12} />
                      {regSecondsLeft > 0
                        ? `Expira em ${formatCountdown(regSecondsLeft)}`
                        : 'Código expirado'}
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2" role="group" aria-label="Código de verificação de 6 dígitos">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        aria-label={`Dígito ${idx + 1} do código`}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="h-12 sm:h-14 rounded-2xl border-2 border-[#DDD6F3] dark:border-[#38316B] bg-white dark:bg-[#121024] text-center font-mono text-xl font-extrabold text-[#25233A] dark:text-white focus:border-[#7047E8] dark:focus:border-[#FFD34E] focus:ring-2 focus:ring-[#7047E8]/25 dark:focus:ring-[#FFD34E]/25 outline-none transition-all tabular-nums"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="confirm"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={otpDigits.join('').length < 6}
                  leftIcon={<ShieldCheck size={17} />}
                >
                  {isSubmitting ? 'Validando Código...' : 'Confirmar e Finalizar Cadastro'}
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setRegisterStep('form');
                    }}
                    className="inline-flex items-center gap-1.5 font-extrabold text-[#77758A] dark:text-[#C5BFE6] hover:text-[#25233A] dark:hover:text-white transition-colors"
                  >
                    <Edit3 size={14} />
                    <span>Corrigir e-mail</span>
                  </button>

                  <button
                    type="button"
                    disabled={regResendCooldown > 0 || isSubmitting}
                    onClick={handleResendVerificationCode}
                    className="inline-flex items-center gap-1.5 font-extrabold text-[#5843F4] dark:text-[#FF9900] disabled:opacity-50 disabled:cursor-not-allowed hover:underline tabular-nums"
                  >
                    <RotateCw size={14} />
                    <span>
                      {regResendCooldown > 0
                        ? `Reenviar em ${regResendCooldown}s`
                        : 'Reenviar código'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* MODE: RECOVER PASSWORD */}
            {mode === 'recover' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF6D1] dark:bg-[#2B244F] border border-[#F2CA52] dark:border-[#FF9900]/60 text-[#7D5406] dark:text-[#FBBF24] flex items-center justify-center">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h2 className="ak-title-display font-executive text-xl font-extrabold text-[#25233A] dark:text-white">
                        Recuperar Senha
                      </h2>
                      <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
                        {recoverStep === 1 && 'Etapa 1 de 3: informe o e-mail ou usuário cadastrado.'}
                        {recoverStep === 2 && 'Etapa 2 de 3: valide o código e crie a nova senha.'}
                        {recoverStep === 3 && 'Etapa 3 de 3: senha atualizada com segurança.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-[#E2E8F0] tabular-nums">
                    {recoverStep}/3
                  </span>
                </div>

                {recoverStep === 1 && (
                  <form onSubmit={handleRequestResetSubmit} className="space-y-4">
                    <EliteInput
                      label="E-mail ou usuário cadastrado"
                      type="text"
                      value={recoverIdentifier}
                      onChange={e => setRecoverIdentifier(e.target.value)}
                      placeholder="seu@email.com ou usuário"
                    />
                    <div className="flex gap-2">
                      <Button type="button" variant="subtle" size="md" onClick={() => switchMode('login')}>
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="flex-1"
                        isLoading={isSubmitting}
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Gerar Código
                      </Button>
                    </div>
                  </form>
                )}

                {recoverStep === 2 && (
                  <form onSubmit={handleConfirmResetSubmit} className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] text-xs font-semibold text-[#25233A] dark:text-[#D8D2F8]">
                      Digite o código de 6 dígitos enviado para <strong>{recoverIdentifier}</strong>.
                    </div>

                    <div
                      data-testid="gmail-spam-warning-banner-recover"
                      className="p-3 rounded-2xl bg-[#FFF4D6] dark:bg-[#27234D] border border-[#FFD34E]/60 dark:border-[#FFD34E]/50 text-xs text-[#25233A] dark:text-[#F8FAFC] space-y-1"
                    >
                      <div className="font-extrabold flex items-center gap-1.5 text-[#8A5A00] dark:text-[#FFD34E]">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Verifique também a Caixa de Spam do Gmail</span>
                      </div>
                      <p className="font-semibold text-[#33466E] dark:text-[#CBD5E1] leading-relaxed">
                        Caso o código não apareça na caixa de entrada principal, confira a pasta de <strong>Spam (Lixo Eletrônico)</strong> do seu Gmail, pois a mensagem pode cair lá.
                      </p>
                    </div>

                    <EliteInput
                      label="Código de verificação (6 dígitos)"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={recoverCode}
                      onChange={e => setRecoverCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="text-center tracking-[0.3em] font-mono"
                    />
                    <EliteInput
                      label="Nova senha (8+ caract. com maiúscula, número e símbolo)"
                      type="password"
                      value={recoverNewPassword}
                      onChange={e => setRecoverNewPassword(e.target.value)}
                      placeholder="Ex: Ajuda@2026"
                    />
                    <PasswordRequirementsChecklist
                      status={recoverPasswordReqs}
                      hasTyped={recoverNewPassword.length > 0}
                      testId="recover-password-requirements-checklist"
                    />
                    <EliteInput
                      label="Confirmar nova senha"
                      type="password"
                      value={recoverConfirmPassword}
                      onChange={e => setRecoverConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="subtle"
                        size="md"
                        onClick={() => {
                          setErrorMsg(null);
                          setSuccessMsg(null);
                          setRecoverStep(1);
                        }}
                      >
                        Pedir Outro
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="flex-1"
                        isLoading={isSubmitting}
                      >
                        Atualizar Senha
                      </Button>
                    </div>
                  </form>
                )}

                {recoverStep === 3 && (
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-2xl bg-[#DCF5D2] dark:bg-[#133A27] border border-[#8ED97A] dark:border-[#2FA10D]/70 text-xs font-bold text-[#1E6917] dark:text-[#6EE7B7] flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-sm mb-0.5">Senha redefinida com sucesso!</p>
                        <p className="dark:text-[#CBD5E1]">Você permanece nesta página segura. Clique abaixo para entrar com a nova senha.</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      rightIcon={<ArrowRight size={16} />}
                      onClick={() => switchMode('login')}
                    >
                      Ir para Tela de Login
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* MODE: PAIR CHILD DEVICE */}
            {mode === 'pair' && (
              <form onSubmit={handlePairSubmit} className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="ak-sticker-badge w-10 h-10 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#7047E8]/50 text-[#7047E8] dark:text-[#B5A0FF] flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h2 className="ak-title-display font-executive text-xl font-extrabold text-[#25233A] dark:text-white">
                      Conectar Aparelho Infantil
                    </h2>
                    <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
                      Use o código de 6 dígitos gerado no painel dos pais.
                    </p>
                  </div>
                </div>

                {pairStatusMsg && (
                  <div className="p-3.5 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#7047E8]/40 text-xs font-bold flex items-center gap-2 text-[#7047E8] dark:text-[#D8D2F8]">
                    <Loader2 size={16} className="animate-spin shrink-0" />
                    <span>{pairStatusMsg}</span>
                  </div>
                )}

                <EliteInput
                  label="Código da Família (6 dígitos)"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pairCode}
                  onChange={e => setPairCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center tracking-[0.35em] font-mono text-lg"
                />

                <EliteInput
                  label="Nome deste aparelho (opcional)"
                  type="text"
                  value={pairDeviceName}
                  onChange={e => setPairDeviceName(e.target.value)}
                  placeholder="Ex: Tablet da Sala"
                />

                <div className="flex gap-2">
                  <Button type="button" variant="subtle" size="md" onClick={() => switchMode('login')}>
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1"
                    isLoading={isSubmitting}
                    disabled={Boolean(waitingConfirmCode)}
                  >
                    {waitingConfirmCode ? 'Aguardando Aprovação...' : 'Conectar Dispositivo'}
                  </Button>
                </div>
              </form>
            )}

            {/* Footer Link to Pair Child Tablet */}
            {mode !== 'pair' && (
              <div className="pt-3 border-t border-[#E2ECF5] dark:border-[#2E3C61] flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#5A6D91] dark:text-[#94A3B8]">
                  Este aparelho é da criança?
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('pair')}
                  className="font-extrabold text-[#1E82CE] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
                >
                  <Smartphone size={14} />
                  <span>Vincular com Código</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Legal / Product Line */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] font-bold text-[#5A6D91] dark:text-[#94A3B8] z-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>
          Ajuda KIDS — Desenvolvido por Eliabe Almeida Gomes • Plataforma Educativa Familiar Multi-Dispositivo
        </span>
        {onOpenAbout && (
          <button
            type="button"
            onClick={onOpenAbout}
            className="font-extrabold underline text-[#7047E8] dark:text-[#B5A0FF] hover:opacity-80"
          >
            Sobre o projeto
          </button>
        )}
      </div>
    </div>
  );
};
