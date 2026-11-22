import React from 'react';
import {
  ArrowLeft,
  Code2,
  Database,
  ExternalLink,
  Globe,
  Info,
  Mail,
  ShieldCheck,
  Sparkles,
  User
} from 'lucide-react';
import { AjudaKidsBrandBadge, AjudaKidsMascot } from '@/components/common/AjudaKidsMascot';
import { AmbientAdultBackdrop } from '@/components/illustrations/ThematicPageBackgrounds';
import { Button } from '@/components/common/Button';

interface AboutViewProps {
  onClose: () => void;
  asModal?: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({ onClose, asModal = false }) => {
  const content = (
    <div
      data-testid="about-page-content"
      className="relative w-full max-w-3xl mx-auto bg-white dark:bg-[#1E1B3A] rounded-[28px] border border-[#E4DFF5] dark:border-[#38316B] shadow-[0_20px_50px_rgba(37,35,58,0.12)] dark:shadow-[0_20px_50px_rgba(8,6,20,0.6)] p-6 sm:p-8 space-y-6 text-[#25233A] dark:text-[#F8F7FF]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#4B428A] flex items-center justify-center text-[#7047E8] dark:text-[#B5A0FF]">
            <Info size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sobre o Ajuda KIDS
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#77758A] dark:text-[#C5BFE6]">
              Plataforma web educativa e de acompanhamento familiar
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="subtle"
          size="sm"
          leftIcon={<ArrowLeft size={15} />}
          onClick={onClose}
        >
          Voltar
        </Button>
      </div>

      {/* Destaque de Autoria */}
      <div className="rounded-[22px] p-5 bg-gradient-to-r from-[#EFEAFC] via-[#F9F8FF] to-[#EBF3FE] dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#171430] border border-[#D8CCFA] dark:border-[#4B428A] flex flex-col sm:flex-row items-center gap-4">
        <div className="shrink-0">
          <AjudaKidsMascot size={74} pose="waving" />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#121024] border border-[#DDD6F3] dark:border-[#38316B] text-[11px] font-extrabold text-[#7047E8] dark:text-[#C7B8FF]">
            <User size={13} />
            <span>Autor do Projeto</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-white">
            Eliabe Almeida Gomes
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#4A4668] dark:text-[#C5BFE6] leading-relaxed">
            Desenvolvedor responsável pela idealização, interface interativa, fluxo de segurança parental, persistência em nuvem e integração com banco de dados do Ajuda KIDS.
          </p>
        </div>
      </div>

      {/* Propósito */}
      <div className="space-y-2">
        <h3 className="font-display text-lg font-extrabold flex items-center gap-2">
          <Sparkles size={18} className="text-[#FF9B42]" />
          <span>O que é e quem ajuda</span>
        </h3>
        <p className="text-sm font-medium text-[#4A4668] dark:text-[#C5BFE6] leading-relaxed">
          O <strong>Ajuda KIDS</strong> apoia famílias e crianças de 4 a 12 anos com jornadas diárias estruturadas em 10 áreas do desenvolvimento infantil, jogos educativos 3D desbloqueados após o estudo, registro emocional, controle saudável de tempo de tela e pareamento seguro de dispositivos infantis com PIN dos responsáveis.
        </p>
      </div>

      {/* Arquitetura e Tecnologias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="rounded-2xl p-4 bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#7047E8] dark:text-[#B5A0FF]">
            <Code2 size={15} />
            <span>Frontend & Experiência 3D</span>
          </div>
          <p className="text-xs font-semibold text-[#4A4668] dark:text-[#C5BFE6] leading-relaxed">
            React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons e Three.js para jogos e cenários 3D interativos.
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#177856] dark:text-[#6EE7B7]">
            <Database size={15} />
            <span>Backend & Banco de Dados</span>
          </div>
          <p className="text-xs font-semibold text-[#4A4668] dark:text-[#C5BFE6] leading-relaxed">
            API serverless na Vercel (<code>api/index.ts</code>), banco PostgreSQL gerenciado no Supabase e sincronia multi-dispositivo em tempo real.
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#4389F5] dark:text-[#93C5FD]">
            <Mail size={15} />
            <span>Autenticação & Verificação</span>
          </div>
          <p className="text-xs font-semibold text-[#4A4668] dark:text-[#C5BFE6] leading-relaxed">
            Cadastro familiar com código OTP de 6 dígitos enviado via Gmail SMTP (Nodemailer), proteção contra duplicidade e recuperação segura.
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#B45309] dark:text-[#FFD34E]">
            <ShieldCheck size={15} />
            <span>Publicação & Código</span>
          </div>
          <p className="text-xs font-semibold text-[#4A4668] dark:text-[#C5BFE6] leading-relaxed">
            Código-fonte versionado em repositório público no GitHub com deploy automático contínuo na Vercel.
          </p>
        </div>
      </div>

      {/* Links públicos */}
      <div className="pt-2 border-t border-[#E4DFF5] dark:border-[#38316B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-[#77758A] dark:text-[#B8B3D6]">
          Ajuda KIDS • Desenvolvido por <strong className="text-[#25233A] dark:text-white">Eliabe Almeida Gomes</strong>
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/elialmds/ajuda-kids"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-extrabold text-[#7047E8] dark:text-[#B5A0FF] hover:underline"
          >
            <Globe size={14} />
            <span>GitHub do Projeto</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );

  if (asModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sobre o Ajuda KIDS"
        className="fixed inset-0 z-50 overflow-y-auto bg-[#121024]/60 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8F7FF] p-4 sm:p-8 flex flex-col justify-between">
      <AmbientAdultBackdrop />
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-3 mb-6 z-10">
        <AjudaKidsBrandBadge size={42} subtitle="SOBRE A PLATAFORMA" />
      </div>
      <div className="relative z-10 my-auto">{content}</div>
      <div className="max-w-3xl w-full mx-auto text-center text-[11px] font-bold text-[#5A6D91] dark:text-[#94A3B8] mt-6 z-10">
        Ajuda KIDS — Eliabe Almeida Gomes
      </div>
    </div>
  );
};
