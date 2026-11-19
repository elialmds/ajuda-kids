# AJUDA KIDS — ELITE DESIGN SYSTEM 7.0

> Sistema de Design unificado, escalável e autoral inspirado em **Lingokids** (personagens e cenários lúdicos), **Duolingo** (hierarquia, bordas táteis 3D e feedback visual), **Khan Academy Kids** (acolhimento infantil e clareza pedagógica) e **ABCmouse** (medalhas, troféus e conquistas colecionáveis).

---

## 1. Auditoria da Fase 1 e Problemas Resolvidos

Todos os problemas diagnosticados nas 5 capturas de tela de referência foram mapeados e reconstruídos:

| Referência | Onde estava no app | Problemas antigos | Reconstrução 7.0 aplicada |
| :--- | :--- | :--- | :--- |
| **Imagem 1** (4 Guardiões) | `ParentAuthView.tsx` & `charactersData.tsx` | Formas geométricas simples (círculos chapados com olhos de ponto e contornos básicos) sobre fundo escuro cinza. | Reconstruídos todos os 7 guardiões (`Lumi`, `Téo`, `Maya`, `Sol`, `Pipoca`, `Flora`, `Kiko`) com volume, sombreamento, duplo brilho ocular, plumagem/pelagem e selos pastéis luminosos. |
| **Imagem 2** (Hero `Olá, eli!`, Avatar e `Pipoca`) | `ChildHomeView.tsx` | **Texto branco invisível** (`dark:text-white`) sobre gradiente creme claro, caixas azul-marinho pesadas e avatares simplistas. | Removida colisão `.dark` no modo infantil (`App.tsx`), criada paleta diurna `#FAFBF7` / `#1E2B48` com alto contraste, reconstruídos os 6 `KID_CHARACTERS` e o novo `Pipoca` atleta. |
| **Imagem 3** (Parque 3D + `Como estou me sentindo?`) | `HandDrawnIllustrations.tsx`, `EmotionCheckIn.tsx`, `CustomIcons.tsx` | Cubo 3D simples e 8 rostos de emoção rudimentares (dois pontos e arco simples) sobre botões escuros. | Novo diorama completo `Games3DHeroIllustration` e 8 novos `EmotionSvgIcon` expressivos com brilho nos olhos, estrelinhas, gota, lágrima e card claro tátil. |
| **Imagem 4** (Grid dos 7 Mundos) | `ChildHomeView.tsx`, `HandDrawnIllustrations.tsx` | Cards escuros/marrons (`dark:bg-[#1C2F42]`, `#352E1B`, `#382128`) sobre céu azul e ilustrações chapadas. | Cards claros temáticos usando `WORLD_TOKENS`, bordas táteis 3D, selos do Guardião e 7 ilustrações vetoriais completas (incluindo novas `CreativityIllustration` e `KnowledgeIllustration`). |
| **Imagem 5** (6 Jogos 3D) | `Games3DHub.tsx` | Ícones genéricos de linha única do Lucide (`Flame`, `Users`, `Activity`, `Sparkles`, `Palette`, `Crown`) em cards azul-escuro idênticos. | Criados 6 emblemas exclusivos em `Game3DEmblemIcon` (`src/design-system/EliteIcons.tsx`), cabeçalhos cenográficos por jogo e cards claros táteis. |

---

## 2. Arquitetura do Design System (`src/design-system/`)

- **`src/design-system/tokens.ts`**:
  - `ELITE_PALETTE`: Superfícies suaves (`#FAFBF7`, `#F3F7EE`, `#E9F5FD`), texto primário (`#1E2B48`), secundário (`#33466E`) e contorno vetorial padrão (`#233052`).
  - `WORLD_TOKENS`: Paletas independentes para todas as 7 áreas (`communication`, `reasoning`, `attention`, `emotional`, `motor`, `creativity`, `knowledge`).
  - `GAME3D_TOKENS`: Gradientes cenográficos, bordas e botões táteis para todos os 6 jogos 3D WebGL.
  - `CARD_STATE_TOKENS`: Tokens semânticos para os **8 estados visuais**.
- **`src/design-system/EliteIcons.tsx`** & **`src/components/illustrations/CustomIcons.tsx`**:
  - `Game3DEmblemIcon`: Emblemas ilustrados exclusivos por jogo 3D (`batata-quente`, `pato-ganso`, `morto-vivo`, `jogo-memoria`, `sequencia-cores`, `simon-says`).
  - `NavTabSvgIcon`: 5 ícones ilustrados para a barra de navegação (`Início`, `Aprender`, `Brincar`, `Progresso`, `Perfil`).
  - `ActivityTypeSvgIcon`: Ícones para todas as mecânicas pedagógicas (`choice`, `word_build`, `pair_matching`, `sequence`, `direction_tap`, `drawing_canvas`, `physical_action`, `breathing`).
  - `StateBadgeSvgIcon`: Ícones de status que acompanham selos de estado.
  - `EmotionSvgIcon`: 8 expressões faciais completas (`happy`, `calm`, `excited`, `tired`, `anxious`, `sad`, `angry`, `fear`).
  - `LanguageSvgIcon`, `LogicSvgIcon`, `AttentionSvgIcon`, `EmotionalSvgIcon`, `MotorSvgIcon`, `CreativitySvgIcon`, `KnowledgeSvgIcon`, `FlameStreakSvg`, `StarSymbolSvg`.
- **`src/design-system/EliteCards.tsx`**:
  - `EliteSurfaceCard`, `EliteStatCard` e `StatePill`.
  - **8 Estados Visuais Suportados**: `available`, `selected`, `in_progress`, `completed`, `recommended`, `new`, `locked`, `disabled` — sempre diferenciados por ícone + texto + borda, nunca dependentes apenas de cor.
- **`src/design-system/EliteRewards.tsx`**:
  - `GoldStarTrophySvg`: Troféu dourado com louros e brilho.
  - `MedalRibbonSvg`: Medalha colecionável com fita dupla.
  - `StreakShieldSvg`: Escudo de constância diária com contador de dias.
  - `WorldMasteryMedallion`: 7 medalhões temáticos exclusivos (um por área do desenvolvimento) usados no `ChildProgressView` e `ChildProfileTab`.
- **`src/data/charactersData.tsx` & `src/components/illustrations/HandDrawnIllustrations.tsx`**:
  - Reconstrução integral dos 7 guardiões (`MUNDO_COMPANIONS`), 6 personagens infantis (`KID_CHARACTERS`) e 10 cenas vetoriais dos Mundos e Jogos 3D.
