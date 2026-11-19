# AJUDA KIDS — REFINAMENTO VISUAL ABSOLUTO 8.0

Atualização completa da interface mantendo integralmente todos os ícones, cards táteis, mascotes/guardiões e ilustrações aprovados do **Elite Design System 7.0**.

## 1. Preservação Integral do Design System 7.0
- `src/design-system/EliteIcons.tsx` — Preservado 100%
- `src/components/illustrations/CustomIcons.tsx` — Preservado 100%
- `src/design-system/EliteCards.tsx` — Preservado 100%
- `src/data/charactersData.tsx` (`KID_CHARACTERS` e `MUNDO_COMPANIONS`) — Preservado 100%
- `src/components/illustrations/HandDrawnIllustrations.tsx` — Preservado 100%
- `src/design-system/EliteRewards.tsx` — Preservado 100%

## 2. Tipografia & Fontes (Plus Jakarta Sans + Fredoka + Nunito + JetBrains Mono)
- `index.html`: `<meta name="color-scheme" content="light only" />` e prevenção de inversão automática de contraste pelo navegador.
- `tailwind.config.js` & `src/index.css`:
  - `font-display` (`Fredoka`): Títulos infantis e ambientação acolhedora.
  - `font-sans` / `font-executive` (`Plus Jakarta Sans` + `Nunito`): Leitura executiva em dashboards, tabelas, formulários e métricas.
  - `tabular-nums`: Alinhamento preciso de minutos, porcentagens, códigos e pontuações.

## 3. Fundos Atmosféricos & Camadas (`ThematicPageBackgrounds.tsx`)
- Enriquecimento dos 5 cenários temáticos infantis (`home`, `learn`, `play`, `progress`, `profile`) com gradientes atmosféricos e vinhetas sutis de leitura.
- Adição de `AmbientAdultBackdrop` para `ParentAuthView`, `FamilyWelcomeHub` e `ParentalDashboardView`.

## 4. Sistema Completo de Formulários & Botões (`EliteForms.tsx` & `Button.tsx`)
- Suporte formal aos 7 estados (`normal`, `hover`, `focus`, `filled`, `invalid`, `disabled`, `loading`) via `FORM_STATE_TOKENS` e `resolveFormFieldState`.
- Componentes: `EliteInput`, `EliteSearchInput`, `EliteSelect`, `EliteToggle`, `EliteRangeSlider`, `EliteSegmentedControl` e `Button` com estados de confirmação, destaque, sutil, destrutivo e loading.

## 5. Gráficos Interativos e Tabelas Estruturadas (`EliteCharts.tsx` & `EliteDataViews.tsx`)
- `EliteWeeklyBarChart`: Escala graduada, linha de referência de meta saudável (`20–30 min`), tooltips interativos e estado vazio informativo.
- `EliteCircularRing`: Medidores circulares de conclusão e meta diária.
- `EliteSkillComparisonBars`: Comparativo das 7 habilidades com avatares dos guardiões.
- `EliteActivityHistoryTable`: Tabela estruturada com busca em tempo real, filtro por área/criança, ordenação por coluna, paginação e fallback responsivo para telas menores.
- `EliteDevicesTable`: Gestão clara de dispositivos pareados e revogação rápida.
