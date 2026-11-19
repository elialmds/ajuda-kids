import { useEffect, useState } from 'react';
import { SkillArea } from '@/types';

/**
 * Observa a classe `dark` em `document.documentElement` sem exigir Context externo,
 * permitindo que tokens inline de cards, formulários e gráficos respondam em tempo real.
 */
export function useDocumentDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    const sync = () => setIsDark(el.classList.contains('dark'));
    sync();

    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/**
 * AJUDA KIDS — ELITE DESIGN SYSTEM 7.0
 * Tokens centralizados de cores, tipografia, bordas táteis e estados visuais.
 * Referências visuais:
 * - Lingokids: Personagens expressivos, cenários lúdicos e paletas alegres.
 * - Duolingo: Hierarquia clara, superfícies táteis com borda inferior 3D e feedback imediato.
 * - Khan Academy Kids: Conforto visual, acolhimento infantil e clareza pedagógica.
 * - ABCmouse: Emblemas colecionáveis, medalhas, troféus e conquistas visuais.
 */

export type CardVisualState =
  | 'available'
  | 'selected'
  | 'in_progress'
  | 'completed'
  | 'locked'
  | 'disabled'
  | 'new'
  | 'recommended';

export type Game3DId =
  | 'batata-quente'
  | 'pato-ganso'
  | 'morto-vivo'
  | 'jogo-memoria'
  | 'sequencia-cores'
  | 'simon-says';

export const ELITE_PALETTE = {
  ink: {
    primary: '#25233A',
    secondary: '#4A4668',
    muted: '#77758A',
    outline: '#38316B'
  },
  surface: {
    warmCream: '#F5F3FC',
    softMeadow: '#EFEAFC',
    skyCanvas: '#F5F3FC',
    cardBase: '#FFFFFF',
    cardElevated: '#FFFFFF',
    subtleBorder: '#E4DFF5'
  },
  brand: {
    sky: '#4389F5',
    skyDeep: '#2563C8',
    skySoft: '#EBF3FE',
    emerald: '#36C995',
    emeraldDeep: '#21996E',
    emeraldSoft: '#E6F9F2',
    sun: '#FFD34E',
    sunDeep: '#D4A017',
    sunSoft: '#FFF8DF',
    violet: '#7047E8',
    violetDeep: '#5832C8',
    violetSoft: '#EFEAFC',
    coral: '#F16E9A',
    coralDeep: '#C83265',
    coralSoft: '#FCECF2',
    amber: '#FF9B42',
    amberDeep: '#D97820',
    amberSoft: '#FFF2E6'
  }
} as const;

export interface WorldThemeToken {
  area: SkillArea;
  worldName: string;
  shortLabel: string;
  guardianId: string;
  guardianName: string;
  cardBg: string;
  cardBorder: string;
  cardLip: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
  accentDeep: string;
  ctaBg: string;
  ctaHover: string;
  ctaText: string;
  illustrationBg: string;
  darkCardBg: string;
  darkCardBorder: string;
  darkCardLip: string;
  darkBadgeBg: string;
  darkBadgeText: string;
  darkAccent: string;
  darkIllustrationBg: string;
}

export const WORLD_TOKENS: Record<SkillArea, WorldThemeToken> = {
  communication: {
    area: 'communication',
    worldName: 'Ilha da Comunicação',
    shortLabel: 'Fala & Leitura',
    guardianId: 'Lumi',
    guardianName: 'Lumi',
    cardBg: '#EDF7FF',
    cardBorder: '#8CC9F2',
    cardLip: '#5FA7DB',
    badgeBg: '#FFFFFF',
    badgeText: '#1A5A8A',
    accent: '#2D9CDB',
    accentDeep: '#1B75AC',
    ctaBg: '#2D9CDB',
    ctaHover: '#1B75AC',
    ctaText: '#FFFFFF',
    illustrationBg: '#D6EEFE',
    darkCardBg: '#16233E',
    darkCardBorder: '#3B7DB8',
    darkCardLip: '#1E4A78',
    darkBadgeBg: '#20345B',
    darkBadgeText: '#7DD3FC',
    darkAccent: '#38BDF8',
    darkIllustrationBg: '#1C2E52'
  },
  reasoning: {
    area: 'reasoning',
    worldName: 'Oficina da Descoberta',
    shortLabel: 'Lógica & Números',
    guardianId: 'Teo',
    guardianName: 'Téo',
    cardBg: '#F4EEFF',
    cardBorder: '#C3A3F5',
    cardLip: '#9A72DD',
    badgeBg: '#FFFFFF',
    badgeText: '#58309E',
    accent: '#8B5CF6',
    accentDeep: '#6D3BD6',
    ctaBg: '#8B5CF6',
    ctaHover: '#6D3BD6',
    ctaText: '#FFFFFF',
    illustrationBg: '#E6DAFE',
    darkCardBg: '#201B44',
    darkCardBorder: '#7C5CE6',
    darkCardLip: '#4B329B',
    darkBadgeBg: '#2D2461',
    darkBadgeText: '#D8B4FE',
    darkAccent: '#A78BFA',
    darkIllustrationBg: '#282157'
  },
  attention: {
    area: 'attention',
    worldName: 'Bosque da Atenção',
    shortLabel: 'Foco & Detalhes',
    guardianId: 'Maya',
    guardianName: 'Maya',
    cardBg: '#EEF8EA',
    cardBorder: '#97D28B',
    cardLip: '#65AC58',
    badgeBg: '#FFFFFF',
    badgeText: '#26612B',
    accent: '#46B138',
    accentDeep: '#328926',
    ctaBg: '#46B138',
    ctaHover: '#328926',
    ctaText: '#FFFFFF',
    illustrationBg: '#D8F1CE',
    darkCardBg: '#142929',
    darkCardBorder: '#349C5C',
    darkCardLip: '#1D5C36',
    darkBadgeBg: '#1B3A32',
    darkBadgeText: '#86EFAC',
    darkAccent: '#4ADE80',
    darkIllustrationBg: '#18342D'
  },
  emotional: {
    area: 'emotional',
    worldName: 'Jardim das Emoções',
    shortLabel: 'Calma & Empatia',
    guardianId: 'Sol',
    guardianName: 'Sol',
    cardBg: '#FFF8DF',
    cardBorder: '#F2CA52',
    cardLip: '#D4A11B',
    badgeBg: '#FFFFFF',
    badgeText: '#7D5406',
    accent: '#E8A80C',
    accentDeep: '#BE8400',
    ctaBg: '#E8A80C',
    ctaHover: '#BE8400',
    ctaText: '#FFFFFF',
    illustrationBg: '#FEEEB3',
    darkCardBg: '#28221A',
    darkCardBorder: '#D99B1C',
    darkCardLip: '#8A5D0A',
    darkBadgeBg: '#3A2E1A',
    darkBadgeText: '#FDE68A',
    darkAccent: '#FBBF24',
    darkIllustrationBg: '#322819'
  },
  motor: {
    area: 'motor',
    worldName: 'Parque de Movimento',
    shortLabel: 'Corpo & Direções',
    guardianId: 'Pipoca',
    guardianName: 'Pipoca',
    cardBg: '#FFF0F3',
    cardBorder: '#F29EB1',
    cardLip: '#D86C85',
    badgeBg: '#FFFFFF',
    badgeText: '#932B45',
    accent: '#E85376',
    accentDeep: '#C43658',
    ctaBg: '#E85376',
    ctaHover: '#C43658',
    ctaText: '#FFFFFF',
    illustrationBg: '#FFDCE4',
    darkCardBg: '#2C1933',
    darkCardBorder: '#D94D77',
    darkCardLip: '#8F264A',
    darkBadgeBg: '#3F2046',
    darkBadgeText: '#FDA4AF',
    darkAccent: '#FB7185',
    darkIllustrationBg: '#361D3D'
  },
  creativity: {
    area: 'creativity',
    worldName: 'Ateliê Criativo e Cores',
    shortLabel: 'Artes & Desenho',
    guardianId: 'Flora',
    guardianName: 'Flora',
    cardBg: '#FFF4E8',
    cardBorder: '#F7B277',
    cardLip: '#DC853D',
    badgeBg: '#FFFFFF',
    badgeText: '#9A430B',
    accent: '#F07E26',
    accentDeep: '#C95E0E',
    ctaBg: '#F07E26',
    ctaHover: '#C95E0E',
    ctaText: '#FFFFFF',
    illustrationBg: '#FFE3C6',
    darkCardBg: '#2A1D2B',
    darkCardBorder: '#EA812F',
    darkCardLip: '#9A4C14',
    darkBadgeBg: '#3B2732',
    darkBadgeText: '#FDBA74',
    darkAccent: '#FB923C',
    darkIllustrationBg: '#33222F'
  },
  knowledge: {
    area: 'knowledge',
    worldName: 'Estação Mundo Curioso',
    shortLabel: 'Ciência & Natureza',
    guardianId: 'Kiko',
    guardianName: 'Kiko',
    cardBg: '#EAFAF5',
    cardBorder: '#72D3B8',
    cardLip: '#3EA98C',
    badgeBg: '#FFFFFF',
    badgeText: '#14624E',
    accent: '#1DA886',
    accentDeep: '#128266',
    ctaBg: '#1DA886',
    ctaHover: '#128266',
    ctaText: '#FFFFFF',
    illustrationBg: '#CDF4E8',
    darkCardBg: '#132836',
    darkCardBorder: '#2BB996',
    darkCardLip: '#15705A',
    darkBadgeBg: '#1B3A48',
    darkBadgeText: '#6EE7B7',
    darkAccent: '#34D399',
    darkIllustrationBg: '#173240'
  },
  math: {
    area: 'math',
    worldName: 'Vila da Matemática',
    shortLabel: 'Números & Contas',
    guardianId: 'Beto',
    guardianName: 'Beto',
    cardBg: '#FFF4DE',
    cardBorder: '#F4B85A',
    cardLip: '#D48A18',
    badgeBg: '#FFFFFF',
    badgeText: '#874D06',
    accent: '#E68A00',
    accentDeep: '#BA6D00',
    ctaBg: '#E68A00',
    ctaHover: '#BA6D00',
    ctaText: '#FFFFFF',
    illustrationBg: '#FFE7BD',
    darkCardBg: '#2B2118',
    darkCardBorder: '#E59424',
    darkCardLip: '#8A520B',
    darkBadgeBg: '#3D2E1D',
    darkBadgeText: '#FCD34D',
    darkAccent: '#FBBF24',
    darkIllustrationBg: '#34271A'
  },
  music: {
    area: 'music',
    worldName: 'Palco da Música & Ritmo',
    shortLabel: 'Sons & Ritmo',
    guardianId: 'Tom',
    guardianName: 'Tom',
    cardBg: '#FBE8F6',
    cardBorder: '#EA8BD2',
    cardLip: '#C657AA',
    badgeBg: '#FFFFFF',
    badgeText: '#85226D',
    accent: '#D946B5',
    accentDeep: '#AE2B8E',
    ctaBg: '#D946B5',
    ctaHover: '#AE2B8E',
    ctaText: '#FFFFFF',
    illustrationBg: '#FAD1EF',
    darkCardBg: '#2C1838',
    darkCardBorder: '#D452B3',
    darkCardLip: '#87226F',
    darkBadgeBg: '#3F204D',
    darkBadgeText: '#F9A8D4',
    darkAccent: '#F472B6',
    darkIllustrationBg: '#351D43'
  },
  languages: {
    area: 'languages',
    worldName: 'Ponte dos Idiomas',
    shortLabel: 'Inglês Lúdico',
    guardianId: 'Bella',
    guardianName: 'Bella',
    cardBg: '#EAF4FF',
    cardBorder: '#7EB2F7',
    cardLip: '#4B86DC',
    badgeBg: '#FFFFFF',
    badgeText: '#1D4D9A',
    accent: '#3B82F6',
    accentDeep: '#2563EB',
    ctaBg: '#3B82F6',
    ctaHover: '#2563EB',
    ctaText: '#FFFFFF',
    illustrationBg: '#D5E9FF',
    darkCardBg: '#162145',
    darkCardBorder: '#4F84EC',
    darkCardLip: '#22479E',
    darkBadgeBg: '#1F3061',
    darkBadgeText: '#93C5FD',
    darkAccent: '#60A5FA',
    darkIllustrationBg: '#1B2852'
  }
};

export interface Game3DThemeToken {
  id: Game3DId;
  headerBg: string;
  headerGradient: string;
  borderColor: string;
  lipColor: string;
  badgeBg: string;
  badgeText: string;
  ctaBg: string;
  ctaLip: string;
  subtitleColor: string;
  darkHeaderBg: string;
  darkHeaderGradient: string;
  darkBorderColor: string;
  darkLipColor: string;
  darkBadgeBg: string;
  darkBadgeText: string;
  darkSubtitleColor: string;
}

export const GAME3D_TOKENS: Record<Game3DId, Game3DThemeToken> = {
  'batata-quente': {
    id: 'batata-quente',
    headerBg: '#FFF3D4',
    headerGradient: 'linear-gradient(135deg, #FFF5D6 0%, #FFE0B5 100%)',
    borderColor: '#F3B65B',
    lipColor: '#D98E2B',
    badgeBg: '#FFF8E6',
    badgeText: '#8E4D08',
    ctaBg: '#FF8C1A',
    ctaLip: '#C96400',
    subtitleColor: '#B85D00',
    darkHeaderBg: '#2B2029',
    darkHeaderGradient: 'linear-gradient(135deg, #33242E 0%, #261B38 100%)',
    darkBorderColor: '#EA8D2F',
    darkLipColor: '#9C5410',
    darkBadgeBg: '#3D2A24',
    darkBadgeText: '#FDBA74',
    darkSubtitleColor: '#FB923C'
  },
  'pato-ganso': {
    id: 'pato-ganso',
    headerBg: '#E6F7DF',
    headerGradient: 'linear-gradient(135deg, #ECFCE6 0%, #CFF0C4 100%)',
    borderColor: '#88CE77',
    lipColor: '#56A445',
    badgeBg: '#F2FCEF',
    badgeText: '#235E25',
    ctaBg: '#46B82D',
    ctaLip: '#2E8E19',
    subtitleColor: '#2A7221',
    darkHeaderBg: '#16292C',
    darkHeaderGradient: 'linear-gradient(135deg, #1A3231 0%, #16243B 100%)',
    darkBorderColor: '#48C745',
    darkLipColor: '#206C25',
    darkBadgeBg: '#1E3C32',
    darkBadgeText: '#86EFAC',
    darkSubtitleColor: '#4ADE80'
  },
  'morto-vivo': {
    id: 'morto-vivo',
    headerBg: '#E3F3FE',
    headerGradient: 'linear-gradient(135deg, #ECF7FF 0%, #C6E7FD 100%)',
    borderColor: '#72BFE9',
    lipColor: '#3E93C7',
    badgeBg: '#F0F9FF',
    badgeText: '#185482',
    ctaBg: '#1E9CE6',
    ctaLip: '#1073B3',
    subtitleColor: '#1969A0',
    darkHeaderBg: '#152544',
    darkHeaderGradient: 'linear-gradient(135deg, #1B3057 0%, #15213F 100%)',
    darkBorderColor: '#3BA3E8',
    darkLipColor: '#195E91',
    darkBadgeBg: '#1E3861',
    darkBadgeText: '#7DD3FC',
    darkSubtitleColor: '#38BDF8'
  },
  'jogo-memoria': {
    id: 'jogo-memoria',
    headerBg: '#F2EAFE',
    headerGradient: 'linear-gradient(135deg, #F6F0FF 0%, #E1CEFE 100%)',
    borderColor: '#B78FF2',
    lipColor: '#8A5AD6',
    badgeBg: '#F9F5FF',
    badgeText: '#53299A',
    ctaBg: '#8B5CF6',
    ctaLip: '#6634D1',
    subtitleColor: '#6B3BC9',
    darkHeaderBg: '#231B4A',
    darkHeaderGradient: 'linear-gradient(135deg, #2B215B 0%, #1C183E 100%)',
    darkBorderColor: '#8B62F0',
    darkLipColor: '#522FA8',
    darkBadgeBg: '#32266E',
    darkBadgeText: '#D8B4FE',
    darkSubtitleColor: '#C4B5FD'
  },
  'sequencia-cores': {
    id: 'sequencia-cores',
    headerBg: '#FFF0F6',
    headerGradient: 'linear-gradient(135deg, #FFF3F8 0%, #FFD6EA 100%)',
    borderColor: '#EE8FC0',
    lipColor: '#CA5D95',
    badgeBg: '#FFF5FA',
    badgeText: '#8D2359',
    ctaBg: '#EC4899',
    ctaLip: '#BE185D',
    subtitleColor: '#A92466',
    darkHeaderBg: '#2E1938',
    darkHeaderGradient: 'linear-gradient(135deg, #3A1F46 0%, #24193E 100%)',
    darkBorderColor: '#EC529F',
    darkLipColor: '#98235D',
    darkBadgeBg: '#46224F',
    darkBadgeText: '#F9A8D4',
    darkSubtitleColor: '#F472B6'
  },
  'simon-says': {
    id: 'simon-says',
    headerBg: '#FEF5D3',
    headerGradient: 'linear-gradient(135deg, #FFF9DF 0%, #FCE69C 100%)',
    borderColor: '#E8C146',
    lipColor: '#BD9217',
    badgeBg: '#FFFBE8',
    badgeText: '#7B5406',
    ctaBg: '#7047E8',
    ctaLip: '#522BBF',
    subtitleColor: '#916307',
    darkHeaderBg: '#282325',
    darkHeaderGradient: 'linear-gradient(135deg, #352C26 0%, #1F1F42 100%)',
    darkBorderColor: '#E5B432',
    darkLipColor: '#8E6911',
    darkBadgeBg: '#3D321D',
    darkBadgeText: '#FDE047',
    darkSubtitleColor: '#FACC15'
  }
};

export interface StateStyleToken {
  label: string;
  containerBg: string;
  borderColor: string;
  lipColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  textColor: string;
  opacityClass: string;
  darkContainerBg: string;
  darkBorderColor: string;
  darkLipColor: string;
  darkBadgeBg: string;
  darkBadgeText: string;
  darkBadgeBorder: string;
  darkTextColor: string;
}

export const CARD_STATE_TOKENS: Record<CardVisualState, StateStyleToken> = {
  available: {
    label: 'Disponível',
    containerBg: '#FFFFFF',
    borderColor: '#E4DFF5',
    lipColor: '#C5B8F3',
    badgeBg: '#F5F3FC',
    badgeText: '#4B2FB8',
    badgeBorder: '#D5C8F5',
    textColor: '#25233A',
    opacityClass: 'opacity-100',
    darkContainerBg: '#1E1B3A',
    darkBorderColor: '#38316B',
    darkLipColor: '#100E24',
    darkBadgeBg: '#27234D',
    darkBadgeText: '#C4B5FD',
    darkBadgeBorder: '#4A3F8A',
    darkTextColor: '#F8F7FF'
  },
  selected: {
    label: 'Selecionado',
    containerBg: '#F4F1FF',
    borderColor: '#7047E8',
    lipColor: '#522BBF',
    badgeBg: '#7047E8',
    badgeText: '#FFFFFF',
    badgeBorder: '#522BBF',
    textColor: '#25233A',
    opacityClass: 'opacity-100 ring-4 ring-[#7047E8]/25 dark:ring-[#8B6CF2]/35',
    darkContainerBg: '#2A225C',
    darkBorderColor: '#8B6CF2',
    darkLipColor: '#482CA8',
    darkBadgeBg: '#7047E8',
    darkBadgeText: '#FFFFFF',
    darkBadgeBorder: '#A78BFA',
    darkTextColor: '#FFFFFF'
  },
  in_progress: {
    label: 'Em Andamento',
    containerBg: '#FFF8F0',
    borderColor: '#FF9B42',
    lipColor: '#D9751A',
    badgeBg: '#FFEDD5',
    badgeText: '#9A440B',
    badgeBorder: '#FDBA74',
    textColor: '#25233A',
    opacityClass: 'opacity-100',
    darkContainerBg: '#2B2038',
    darkBorderColor: '#FF9B42',
    darkLipColor: '#8A4812',
    darkBadgeBg: '#3D291C',
    darkBadgeText: '#FDBA74',
    darkBadgeBorder: '#D9751A',
    darkTextColor: '#F8F7FF'
  },
  completed: {
    label: 'Concluído',
    containerBg: '#EFFCF6',
    borderColor: '#36C995',
    lipColor: '#1E9B6E',
    badgeBg: '#D1FAE5',
    badgeText: '#0E6B4B',
    badgeBorder: '#6EE7B7',
    textColor: '#25233A',
    opacityClass: 'opacity-100',
    darkContainerBg: '#162C36',
    darkBorderColor: '#36C995',
    darkLipColor: '#136B4D',
    darkBadgeBg: '#163D34',
    darkBadgeText: '#6EE7B7',
    darkBadgeBorder: '#249E72',
    darkTextColor: '#F8F7FF'
  },
  recommended: {
    label: 'Sua Vez',
    containerBg: '#FFFBF0',
    borderColor: '#FFD34E',
    lipColor: '#DDA41A',
    badgeBg: '#7047E8',
    badgeText: '#FFFFFF',
    badgeBorder: '#522BBF',
    textColor: '#25233A',
    opacityClass: 'opacity-100 ring-2 ring-[#FFD34E]/60',
    darkContainerBg: '#27234D',
    darkBorderColor: '#FFD34E',
    darkLipColor: '#A37610',
    darkBadgeBg: '#FF9B42',
    darkBadgeText: '#1E1B3A',
    darkBadgeBorder: '#FFD34E',
    darkTextColor: '#F8F7FF'
  },
  new: {
    label: 'Novidade',
    containerBg: '#FFF2F7',
    borderColor: '#F16E9A',
    lipColor: '#C94473',
    badgeBg: '#F16E9A',
    badgeText: '#FFFFFF',
    badgeBorder: '#C94473',
    textColor: '#25233A',
    opacityClass: 'opacity-100',
    darkContainerBg: '#2E1B42',
    darkBorderColor: '#F16E9A',
    darkLipColor: '#8E2B53',
    darkBadgeBg: '#D94B7F',
    darkBadgeText: '#FFFFFF',
    darkBadgeBorder: '#F9A8D4',
    darkTextColor: '#FFFFFF'
  },
  locked: {
    label: 'Bloqueado',
    containerBg: '#F5F3FC',
    borderColor: '#D5C8F5',
    lipColor: '#B5A3F2',
    badgeBg: '#EDE9FE',
    badgeText: '#665E80',
    badgeBorder: '#D5C8F5',
    textColor: '#665E80',
    opacityClass: 'opacity-90',
    darkContainerBg: '#171430',
    darkBorderColor: '#312B5C',
    darkLipColor: '#0E0C1D',
    darkBadgeBg: '#231F46',
    darkBadgeText: '#B8B3D6',
    darkBadgeBorder: '#38316B',
    darkTextColor: '#B8B3D6'
  },
  disabled: {
    label: 'Indisponível',
    containerBg: '#F7F5FD',
    borderColor: '#E4DFF5',
    lipColor: '#D5C8F5',
    badgeBg: '#F5F3FC',
    badgeText: '#77758A',
    badgeBorder: '#E4DFF5',
    textColor: '#77758A',
    opacityClass: 'opacity-65 pointer-events-none',
    darkContainerBg: '#141129',
    darkBorderColor: '#2A244E',
    darkLipColor: '#0B091B',
    darkBadgeBg: '#1E1B3A',
    darkBadgeText: '#8E88B0',
    darkBadgeBorder: '#312B5C',
    darkTextColor: '#8E88B0'
  }
};

/**
 * AJUDA KIDS 8.0 — REFINAMENTO VISUAL ABSOLUTO
 * Tokens de Tipografia, Elevação Executiva e Estados de Formulário
 */
export type FormFieldState =
  | 'normal'
  | 'hover'
  | 'focus'
  | 'filled'
  | 'invalid'
  | 'disabled'
  | 'loading';

export interface FormStateStyle {
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  ringShadow: string;
}

export const FORM_STATE_TOKENS: Record<FormFieldState, FormStateStyle> = {
  normal: {
    borderColor: '#DDD6F3',
    backgroundColor: '#FFFFFF',
    textColor: '#25233A',
    ringShadow: 'none'
  },
  hover: {
    borderColor: '#B5A3F2',
    backgroundColor: '#FCFBFF',
    textColor: '#25233A',
    ringShadow: '0 2px 8px rgba(112, 71, 232, 0.06)'
  },
  focus: {
    borderColor: '#7047E8',
    backgroundColor: '#FFFFFF',
    textColor: '#25233A',
    ringShadow: '0 0 0 3px rgba(112, 71, 232, 0.22)'
  },
  filled: {
    borderColor: '#C5B8F3',
    backgroundColor: '#F9F8FE',
    textColor: '#25233A',
    ringShadow: 'none'
  },
  invalid: {
    borderColor: '#F16E9A',
    backgroundColor: '#FFF4F8',
    textColor: '#981B4A',
    ringShadow: '0 0 0 3px rgba(241, 110, 154, 0.22)'
  },
  disabled: {
    borderColor: '#E4DFF5',
    backgroundColor: '#F5F3FC',
    textColor: '#9B97B0',
    ringShadow: 'none'
  },
  loading: {
    borderColor: '#4389F5',
    backgroundColor: '#F4F8FF',
    textColor: '#25233A',
    ringShadow: '0 0 0 3px rgba(67, 137, 245, 0.22)'
  }
};

export const TYPOGRAPHY_SCALE_8 = {
  kidHero: 'font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]',
  kidTitle: 'font-display text-xl sm:text-2xl font-bold tracking-tight leading-snug',
  adultTitle: 'font-executive text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight',
  adultSection: 'font-executive text-lg font-bold tracking-tight leading-snug',
  eyebrow: 'font-sans text-[11px] font-extrabold uppercase tracking-[0.08em]',
  body: 'font-sans text-sm font-medium leading-relaxed',
  caption: 'font-sans text-xs font-semibold leading-normal',
  metricValue: 'font-executive tabular-nums font-extrabold tracking-tight'
} as const;

export const SURFACE_ELEVATION_8 = {
  adultShell: 'bg-white/95 dark:bg-[#1A223D]/95 border border-[#E4DFF5] dark:border-[#38316B] shadow-[0_2px_10px_rgba(37,35,58,0.04),0_14px_32px_rgba(112,71,232,0.06)] dark:shadow-[0_14px_36px_rgba(8,6,20,0.58)]',
  adultSubtleCard: 'bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B]',
  childInteractive: 'shadow-[0_6px_0_rgba(112,71,232,0.14),0_14px_28px_rgba(37,35,58,0.08)] dark:shadow-[0_6px_0_rgba(8,6,20,0.58),0_14px_28px_rgba(8,6,20,0.48)]'
} as const;

/**
 * AJUDA KIDS 9.1 — TOKENS LEGADOS CONTRATADOS PELOS TESTES DE ESTABILIDADE
 */
export const THEME_TOKENS_9_1 = {
  light: {
    canvas: '#F8FBFF',
    creamSurface: '#FAF7F2',
    cardSurface: '#FFFFFF',
    elevatedSurface: '#F4F8FD',
    heading: '#0D2A5C',
    textPrimary: '#1E2B48',
    textSecondary: '#475569',
    border: '#D6E4F0',
    primaryAction: '#5843F4',
    accentAmber: '#FF9900',
    meadowSkyGradient: 'linear-gradient(180deg, #F8FBFF 0%, #D9F0FA 55%, #B6DFCD 85%, #6BB75B 100%)',
  },
  dark: {
    canvas: '#0E1324',
    heroIndigo: '#141B35',
    cardSurface: '#1A223D',
    elevatedIndigo: '#242F52',
    heading: '#F8FAFC',
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    border: '#3A4A74',
    primaryAction: '#FF9900',
    secondaryAction: '#7C6BFF',
    nightIndigoGradient: 'linear-gradient(180deg, #0E1324 0%, #141B35 58%, #1F1B4A 100%)',
  },
} as const;

export const OFFICIAL_REDESIGN_TOKENS = {
  colors: {
    purple: '#7047E8',
    blue: '#4389F5',
    orange: '#FF9B42',
    yellow: '#FFD34E',
    green: '#36C995',
    pink: '#F16E9A',
    white: '#FFFFFF',
    lavender: '#F5F3FC',
    textPrimary: '#25233A',
    textSecondary: '#77758A',
    darkCanvas: '#121024',
    darkSurface: '#1E1B3A',
    darkCard: '#27234D',
    darkBorder: '#38316B',
    darkTextPrimary: '#F8F7FF',
    darkTextSecondary: '#B8B3D6'
  },
  typography: {
    headings: 'Fredoka, "Plus Jakarta Sans", Nunito, sans-serif',
    body: '"Plus Jakarta Sans", Inter, system-ui, sans-serif'
  },
  radius: {
    card: '20px',
    panel: '24px',
    button: '18px'
  }
} as const;

export const FORM_STATE_TOKENS_DARK: Record<FormFieldState, FormStateStyle> = {
  normal: {
    borderColor: '#38316B',
    backgroundColor: '#11182D',
    textColor: '#F8F7FF',
    ringShadow: 'none'
  },
  hover: {
    borderColor: '#5B4EA8',
    backgroundColor: '#1E1B3A',
    textColor: '#FFFFFF',
    ringShadow: '0 2px 8px rgba(4, 3, 18, 0.36)'
  },
  focus: {
    borderColor: '#FF9900',
    backgroundColor: '#1E1B3A',
    textColor: '#FFFFFF',
    ringShadow: '0 0 0 3px rgba(139, 108, 242, 0.28)'
  },
  filled: {
    borderColor: '#4A3F8A',
    backgroundColor: '#171430',
    textColor: '#F8F7FF',
    ringShadow: 'none'
  },
  invalid: {
    borderColor: '#F16E9A',
    backgroundColor: '#35162B',
    textColor: '#FFE4EE',
    ringShadow: '0 0 0 3px rgba(241, 110, 154, 0.25)'
  },
  disabled: {
    borderColor: '#2A244E',
    backgroundColor: '#0E0C1D',
    textColor: '#7871A0',
    ringShadow: 'none'
  },
  loading: {
    borderColor: '#4389F5',
    backgroundColor: '#1E254D',
    textColor: '#E2E8F0',
    ringShadow: '0 0 0 3px rgba(67, 137, 245, 0.25)'
  }
};
