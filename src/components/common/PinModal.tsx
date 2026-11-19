import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, Delete, KeyRound, ShieldAlert, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Button } from './Button';
import { EliteInput } from '@/design-system/EliteForms';
import { audioService } from '@/services/audioService';
import { storageService } from '@/services/storageService';
import {
  evaluatePasswordRequirements,
  getPasswordRequirementErrorMessage
} from '@/services/authService';
import { useApp } from '@/modules/context/AppContext';

export interface PinVerifyResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  remainingSeconds?: number;
  failedAttempts?: number;
}

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  verifyPinFn: (pin: string) => Promise<PinVerifyResult>;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  verifyPinFn
}) => {
  const {
    authSession,
    familyAccount,
    recoverParentPinWithPassword,
    requestPasswordReset,
    confirmPasswordReset
  } = useApp();

  const [mode, setMode] = useState<'verify' | 'recover' | 'recover_password'>('verify');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);

  // PIN Recovery state
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  // Embedded account password recovery state
  const [pwdStep, setPwdStep] = useState<1 | 2>(1);
  const [pwdCode, setPwdCode] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');

  // Track open transition so periodic background sync never resets the recovery tab mid-typing
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      setMode('verify');
      setPin('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsVerifying(false);
      setParentPassword('');
      setNewPin('');
      setConfirmNewPin('');
      setPwdStep(1);
      setPwdCode('');
      setPwdNew('');
      setPwdConfirm('');
      setRecoverIdentifier(
        authSession?.parentEmail || familyAccount?.parentEmail || authSession?.username || ''
      );

      const secState = storageService.getPinSecurityState();
      setLockSeconds(secState.remainingSeconds);
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
  }, [isOpen, authSession, familyAccount]);

  useEffect(() => {
    if (isOpen && !recoverIdentifier) {
      const candidate =
        authSession?.parentEmail || familyAccount?.parentEmail || authSession?.username || '';
      if (candidate) {
        setRecoverIdentifier(candidate);
      }
    }
  }, [isOpen, recoverIdentifier, authSession, familyAccount]);

  // Countdown timer when temporarily locked due to brute-force attempts
  useEffect(() => {
    if (!isOpen || lockSeconds <= 0) return;
    const interval = setInterval(() => {
      const secState = storageService.getPinSecurityState();
      setLockSeconds(secState.remainingSeconds);
      if (secState.remainingSeconds <= 0) {
        setErrorMsg('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, lockSeconds]);

  if (!isOpen) return null;

  const isLocked = lockSeconds > 0;

  const handleDigit = (digit: string) => {
    if (isLocked || isVerifying) return;
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      setErrorMsg('');
      audioService.playGentlePop();
      if (next.length === 4) {
        verifySubmission(next);
      }
    }
  };

  const handleBackspace = () => {
    if (isLocked || isVerifying) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
      audioService.playGentlePop();
    }
  };

  const handleClear = () => {
    if (isLocked || isVerifying) return;
    setPin('');
    setErrorMsg('');
  };

  const verifySubmission = async (pinToTest = pin) => {
    if (isLocked) return;
    if (pinToTest.length < 4) {
      setErrorMsg('Digite pelo menos 4 dígitos.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    const res = await verifyPinFn(pinToTest);
    setIsVerifying(false);

    if (res.success) {
      onSuccess();
    } else {
      if (res.locked && res.remainingSeconds) {
        setLockSeconds(res.remainingSeconds);
      } else {
        const secState = storageService.getPinSecurityState();
        if (secState.remainingSeconds > 0) {
          setLockSeconds(secState.remainingSeconds);
        }
      }
      setErrorMsg(res.error || 'PIN incorreto. Tente novamente.');
      setPin('');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!recoverIdentifier.trim()) {
      setErrorMsg('Informe o e-mail ou nome de usuário da conta dos pais.');
      return;
    }
    if (!parentPassword) {
      setErrorMsg('Digite a senha da conta dos responsáveis para validar sua identidade.');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setErrorMsg('O novo PIN deve ter exatamente 4 dígitos numéricos.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setErrorMsg('A confirmação do novo PIN não coincide.');
      return;
    }

    setIsVerifying(true);
    const res = await recoverParentPinWithPassword(
      parentPassword,
      newPin,
      recoverIdentifier.trim()
    );
    setIsVerifying(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Não foi possível validar sua identidade.');
      return;
    }

    setSuccessMsg('Identidade confirmada e novo PIN salvo com segurança!');
    setLockSeconds(0);
    setTimeout(() => {
      onSuccess();
    }, 650);
  };

  const handleRequestAccountPasswordCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!recoverIdentifier.trim()) {
      setErrorMsg('Informe o e-mail ou nome de usuário cadastrado.');
      return;
    }
    setIsVerifying(true);
    const res = await requestPasswordReset(recoverIdentifier.trim());
    setIsVerifying(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Não foi possível gerar o código de recuperação.');
      return;
    }
    setSuccessMsg(
      res.message || 'Se a conta existir, enviamos um código de verificação de 6 dígitos para o e-mail cadastrado.'
    );
    setPwdStep(2);
  };

  const handleConfirmAccountPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!pwdCode.trim()) {
      setErrorMsg('Informe o código de verificação de 6 dígitos.');
      return;
    }
    const pwdErr = getPasswordRequirementErrorMessage(pwdNew);
    if (pwdErr) {
      setErrorMsg(pwdErr);
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }
    setIsVerifying(true);
    const res = await confirmPasswordReset({
      identifier: recoverIdentifier.trim(),
      code: pwdCode.trim(),
      newPassword: pwdNew
    });
    setIsVerifying(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Código inválido ou expirado.');
      return;
    }
    setParentPassword(pwdNew);
    setPwdStep(1);
    setPwdCode('');
    setPwdNew('');
    setPwdConfirm('');
    setMode('recover');
    setSuccessMsg('Senha da conta redefinida! Agora escolha seu novo PIN abaixo.');
  };

  const pwdReqs = evaluatePasswordRequirements(pwdNew);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25233A]/50 dark:bg-[#080616]/80 backdrop-blur-sm animate-fadeIn">
      <div className="ak-card-3d relative w-full max-w-sm bg-white dark:bg-[#1E1B3A] rounded-[32px] shadow-soft dark:shadow-[0_24px_60px_rgba(4,6,18,0.75)] p-6 sm:p-7 border-2 border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-[#F8FAFC]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#D8D2F8] flex items-center justify-center hover:bg-[#EDE9FE] dark:hover:bg-[#38316B] transition-colors"
        >
          <X size={18} />
        </button>

        {mode === 'verify' ? (
          <>
            {/* Header */}
            <div className="text-center mb-5">
              <div
                className={`ak-sticker-badge w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
                  isLocked
                    ? 'bg-rose-100 dark:bg-[#4C1D24] text-rose-600 dark:text-[#FDA4AF]'
                    : 'bg-[#F3EFFF] dark:bg-[#27234D] text-[#7047E8] dark:text-[#B5A0FF]'
                }`}
              >
                {isLocked ? <ShieldAlert size={26} /> : <Lock size={26} />}
              </div>
              <h3 className="ak-title-display text-xl font-black text-[#25233A] dark:text-white">Área dos Responsáveis</h3>
              <p className="text-xs font-medium text-[#77758A] dark:text-[#C5BFE6] mt-1">
                Digite seu PIN parental para acessar controles e relatórios.
              </p>
            </div>

            {/* Lockout Countdown Banner */}
            {isLocked && (
              <div className="mb-4 text-center text-xs font-black text-rose-700 dark:text-[#FDA4AF] bg-rose-50 dark:bg-[#4C1D24] py-3 px-3 rounded-2xl border border-rose-200 dark:border-[#9F1239]">
                Muitas tentativas incorretas. Aguarde <span className="text-sm">{lockSeconds}s</span> para tentar novamente.
              </div>
            )}

            {/* PIN Dots */}
            <div className="flex justify-center items-center gap-3 mb-5" aria-label="Dígitos do PIN">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                    pin.length > idx
                      ? 'bg-[#7047E8] dark:bg-[#8B68F7] border-[#522BBF] dark:border-[#C4B5FD] scale-110'
                      : 'bg-[#F5F3FC] dark:bg-[#121024] border-[#DDD6F3] dark:border-[#38316B]'
                  }`}
                />
              ))}
              {pin.length > 4 && (
                <div className="w-4 h-4 rounded-full bg-[#7047E8] dark:bg-[#8B68F7] border-2 border-[#522BBF] dark:border-[#C4B5FD] scale-110" />
              )}
              {pin.length > 5 && (
                <div className="w-4 h-4 rounded-full bg-[#7047E8] dark:bg-[#8B68F7] border-2 border-[#522BBF] dark:border-[#C4B5FD] scale-110" />
              )}
            </div>

            {/* Error message */}
            {!isLocked && errorMsg && (
              <div className="mb-4 text-center text-xs font-bold text-rose-600 dark:text-[#FDA4AF] bg-rose-50 dark:bg-[#4C1D24] py-2 px-3 rounded-xl border border-rose-200 dark:border-[#9F1239] animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  disabled={isVerifying || isLocked}
                  className="h-12 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8FAFC] border border-[#E4DFF5] dark:border-[#38316B] font-black text-lg hover:bg-[#EDE9FE] dark:hover:bg-[#27234D] active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                disabled={isVerifying || isLocked || pin.length === 0}
                className="h-12 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] text-[#77758A] dark:text-[#C5BFE6] border border-[#E4DFF5] dark:border-[#38316B] font-bold text-xs hover:bg-[#EDE9FE] dark:hover:bg-[#27234D] active:scale-95 transition-all disabled:opacity-40"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                disabled={isVerifying || isLocked}
                className="h-12 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8FAFC] border border-[#E4DFF5] dark:border-[#38316B] font-black text-lg hover:bg-[#EDE9FE] dark:hover:bg-[#27234D] active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                disabled={isVerifying || isLocked || pin.length === 0}
                aria-label="Apagar dígito"
                className="h-12 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8FAFC] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-center hover:bg-[#EDE9FE] dark:hover:bg-[#27234D] active:scale-95 transition-all disabled:opacity-40"
              >
                <Delete size={20} />
              </button>
            </div>

            {/* Action Button */}
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={pin.length < 4 || isVerifying || isLocked}
              onClick={() => verifySubmission()}
            >
              {isLocked
                ? `Bloqueado (${lockSeconds}s)`
                : isVerifying
                ? 'Verificando...'
                : 'Entrar no Painel'}
            </Button>

            {/* Secure Recovery Option (NEVER reveals current PIN) */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('recover');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#7047E8] dark:text-[#B5A0FF] hover:text-[#25233A] dark:hover:text-white hover:underline transition-colors"
              >
                <KeyRound size={13} />
                <span>Esqueci meu PIN</span>
              </button>
            </div>
          </>
        ) : mode === 'recover' ? (
          /* RECOVER PIN MODE (IDENTITY VERIFICATION REQUIRED) */
          <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
            <div className="text-center mb-3">
              <div className="ak-sticker-badge w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2 bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#7047E8] text-[#7047E8] dark:text-[#E9D5FF]">
                <KeyRound size={24} />
              </div>
              <h3 className="ak-title-display font-executive text-lg font-extrabold text-[#25233A] dark:text-white">Redefinir PIN Parental</h3>
              <p className="text-xs font-medium text-[#77758A] dark:text-[#C5BFE6] mt-1">
                Confirme a senha da sua conta parental para cadastrar um novo PIN.
              </p>
            </div>

            <EliteInput
              label="E-mail ou Usuário da Família"
              size="sm"
              type="text"
              value={recoverIdentifier}
              onChange={e => setRecoverIdentifier(e.target.value)}
              placeholder="seu@email.com"
              leftIcon={<Mail size={15} />}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC]">
                  Senha da Conta dos Pais
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('recover_password');
                    setPwdStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] font-extrabold text-[#7047E8] dark:text-[#B5A0FF] hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <EliteInput
                size="sm"
                type="password"
                value={parentPassword}
                onChange={e => setParentPassword(e.target.value)}
                placeholder="Digite sua senha de acesso"
                leftIcon={<Lock size={15} />}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <EliteInput
                label="Novo PIN (4 dígitos)"
                size="sm"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="text-center tracking-widest font-mono"
              />
              <EliteInput
                label="Confirmar PIN"
                size="sm"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmNewPin}
                onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="text-center tracking-widest font-mono"
              />
            </div>

            {errorMsg && (
              <div className="text-center text-xs font-bold text-[#BE123C] dark:text-[#FDA4AF] bg-[#FFF1F2] dark:bg-[#4C1D24] py-2 px-3 rounded-xl border border-[#FECDD3] dark:border-[#9F1239]">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="text-center text-xs font-bold text-[#1E6917] dark:text-[#86EFAC] bg-[#DCF5D2] dark:bg-[#133A27] py-2 px-3 rounded-xl border border-[#8ED97A] dark:border-[#25D366]/60 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>{successMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isVerifying}
              disabled={isVerifying || Boolean(successMsg && !successMsg.includes('Senha da conta'))}
            >
              Confirmar e Redefinir PIN
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('verify');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6] hover:text-[#25233A] dark:hover:text-white"
              >
                <ArrowLeft size={13} />
                <span>Voltar para digitar PIN</span>
              </button>
            </div>
          </form>
        ) : (
          /* EMBEDDED ACCOUNT PASSWORD RECOVERY */
          <div className="space-y-3.5">
            <div className="text-center mb-2">
              <div className="ak-sticker-badge w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2 bg-[#FFF4D6] dark:bg-[#38316B] border border-[#FFD34E] dark:border-[#FFD34E]/60 text-[#8A5A00] dark:text-[#FFD34E]">
                <KeyRound size={24} />
              </div>
              <h3 className="ak-title-display font-executive text-lg font-extrabold text-[#25233A] dark:text-white">Recuperar Senha da Conta</h3>
              <p className="text-xs font-medium text-[#77758A] dark:text-[#C5BFE6] mt-1">
                {pwdStep === 1
                  ? 'Etapa 1 de 2: Gere um código de verificação no e-mail da família.'
                  : 'Etapa 2 de 2: Confirme o código e defina sua nova senha.'}
              </p>
            </div>

            {pwdStep === 1 ? (
              <form onSubmit={handleRequestAccountPasswordCode} className="space-y-3">
                <EliteInput
                  label="E-mail ou Usuário da Conta"
                  size="sm"
                  type="text"
                  value={recoverIdentifier}
                  onChange={e => setRecoverIdentifier(e.target.value)}
                  placeholder="seu@email.com"
                  leftIcon={<Mail size={15} />}
                  error={errorMsg || undefined}
                />
                <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isVerifying}>
                  Gerar Código de Verificação
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmAccountPasswordReset} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-[#FFF8DC] dark:bg-[#2B244F] border border-[#E6C85C] dark:border-[#FF9900]/50 text-[11px] font-semibold text-[#33466E] dark:text-[#FDE68A]">
                  Confira sua caixa de entrada e também a pasta de <strong>Spam (Lixo Eletrônico)</strong> do Gmail.
                </div>
                <EliteInput
                  size="sm"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pwdCode}
                  onChange={e => setPwdCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Código de 6 dígitos"
                  className="text-center tracking-widest font-mono"
                />
                <EliteInput
                  size="sm"
                  type="password"
                  value={pwdNew}
                  onChange={e => setPwdNew(e.target.value)}
                  placeholder="Nova senha (8+ caract., A-Z, 0-9, símbolo)"
                />
                <div className="grid grid-cols-2 gap-1 text-[10px] font-bold px-1">
                  <span className={pwdReqs.minLength ? 'text-[#1E6917] dark:text-[#4ADE80]' : 'text-[#5A6D91] dark:text-[#CBD5E1]'}>
                    {pwdReqs.minLength ? '✓' : '○'} 8+ caracteres
                  </span>
                  <span className={pwdReqs.hasUppercase ? 'text-[#1E6917] dark:text-[#4ADE80]' : 'text-[#5A6D91] dark:text-[#CBD5E1]'}>
                    {pwdReqs.hasUppercase ? '✓' : '○'} Letra maiúscula
                  </span>
                  <span className={pwdReqs.hasNumber ? 'text-[#1E6917] dark:text-[#4ADE80]' : 'text-[#5A6D91] dark:text-[#CBD5E1]'}>
                    {pwdReqs.hasNumber ? '✓' : '○'} Número (0–9)
                  </span>
                  <span className={pwdReqs.hasSpecial ? 'text-[#1E6917] dark:text-[#4ADE80]' : 'text-[#5A6D91] dark:text-[#CBD5E1]'}>
                    {pwdReqs.hasSpecial ? '✓' : '○'} Caractere especial
                  </span>
                </div>
                <EliteInput
                  size="sm"
                  type="password"
                  value={pwdConfirm}
                  onChange={e => setPwdConfirm(e.target.value)}
                  placeholder="Confirmar nova senha"
                  error={errorMsg || undefined}
                  successText={successMsg || undefined}
                />
                <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isVerifying}>
                  Atualizar Senha da Conta
                </Button>
              </form>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('recover');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6] hover:text-[#25233A] dark:hover:text-white"
              >
                <ArrowLeft size={13} />
                <span>Voltar para redefinir PIN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
